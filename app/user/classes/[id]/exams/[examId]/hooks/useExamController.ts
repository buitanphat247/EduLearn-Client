import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { App } from "antd";
import Swal from "sweetalert2";
import io, { type Socket } from "socket.io-client";
import { RagTestDetail, RagQuestion, getRagTestDetail } from "@/lib/api/rag-exams";
import { startExamAttempt, submitExamAttempt, logSecurityEvent } from "@/lib/api/exam-attempts";
import { useAntiCheat } from "@/app/hooks/useAntiCheat";

// --- Constants & Config (đọc từ .env, anti-cheat tắt khi bất kỳ điều kiện nào = true) ---
const QUESTIONS_PER_PAGE = 1;
const isMockExamMode = typeof process !== "undefined" && process.env.NEXT_PUBLIC_EXAM_MOCK_DATA === "true";
const isExamDevMode = process.env.NEXT_PUBLIC_EXAM_DEV_MODE === "true";
/** false = tắt anti-cheat hoàn toàn; true hoặc không set = bật (khi không phải mock/dev) */
const isAntiCheatDisabledByEnv = process.env.NEXT_PUBLIC_EXAM_ANTICHEAT_ENABLED === "false";

// Mock Data Generator
const createMockTest = (examId: string): RagTestDetail => {
  const numQuestions = 9;
  return {
    id: examId,
    title: "Mock Test Toán 10 (Dev Mode)",
    description: "Đề thi thử giả lập để kiểm tra giao diện & flow.",
    num_questions: numQuestions,
    duration_minutes: 30,
    total_score: 10,
    created_at: new Date().toISOString(),
    is_published: true,
    mode: "official",
    max_attempts: 3,
    end_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    max_violations: 5,
    user_attempt_count: 0,
    questions: Array.from({ length: numQuestions }).map((_, i) => ({
      id: `q${i + 1}`,
      content: `Câu hỏi mock số ${i + 1}: Nội dung giả lập để test giao diện.`,
      options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      correct_answer: "A",
      explanation: "",
      score: 1.25,
      order: i + 1,
    })),
  };
};

export function useExamController(examId: string, classId: string, studentId: number | null) {
  const router = useRouter();
  const { message, modal } = App.useApp();

  // --- Core State ---
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<RagTestDetail | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // Controls Fullscreen & Timer

  // --- Exam Interaction State ---
  const [currentPage, setCurrentPage] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  // --- Timer & Connection State ---
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [serverViolationCount, setServerViolationCount] = useState(0);
  const [systemAlert, setSystemAlert] = useState<string | null>(null);
  const [isDevToolsBlocked, setIsDevToolsBlocked] = useState(false);

  // --- Refs (Mutable state for deps) ---
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const attemptIdRef = useRef<string | null>(null);
  const latestAnswersRef = useRef<Record<string, string>>({});
  const isSubmittedRef = useRef(false);
  const hasStartedRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync refs
  useEffect(() => {
    attemptIdRef.current = attemptId;
  }, [attemptId]);
  useEffect(() => {
    latestAnswersRef.current = userAnswers;
  }, [userAnswers]);
  useEffect(() => {
    isSubmittedRef.current = isSubmitted;
  }, [isSubmitted]);
  useEffect(() => {
    hasStartedRef.current = hasStarted;
  }, [hasStarted]);

  // Chuẩn hóa answers đã lưu (full text) sang A/B/C/D khi resume
  const normalizeResumedAnswers = (
    answers: Record<string, string>,
    questions: RagQuestion[]
  ): Record<string, string> => {
    const qMap = new Map(questions.map((q) => [q.id, q]));
    const result: Record<string, string> = {};
    for (const [qId, val] of Object.entries(answers)) {
      if (!val) continue;
      const trimmed = val.replace(/^[A-Z][\.\)]\s*/, "").trim();
      if (["A", "B", "C", "D"].includes(trimmed)) {
        result[qId] = trimmed;
        continue;
      }
      const q = qMap.get(qId);
      if (!q?.options) {
        result[qId] = val;
        continue;
      }
      const idx = q.options.findIndex(
        (opt) => opt === val || opt.replace(/^[A-Z][\.\)]\s*/, "").trim() === trimmed
      );
      result[qId] = idx >= 0 ? String.fromCharCode(65 + idx) : val;
    }
    return result;
  };

  // Giữ sanitizeAnswers cho submit - giờ đã gửi A/B/C/D nên gần như no-op
  const sanitizeAnswers = (answers: Record<string, string>) => {
    const cleaned: Record<string, string> = {};
    Object.entries(answers).forEach(([key, val]) => {
      const v = val.replace(/^[A-Z][\.\)]\s*/, "").trim();
      cleaned[key] = ["A", "B", "C", "D"].includes(v) ? v : val;
    });
    return cleaned;
  };

  // --- 1. ANTI-CHEAT & SECURITY (Defined First) ---
  const handleViolation = useCallback((type: string, msg: string) => {
    if (isAntiCheatDisabledByEnv || isMockExamMode || isSubmittedRef.current) return;

    if (socketRef.current?.connected && attemptIdRef.current) {
      socketRef.current.emit("report_violation", {
        attemptId: attemptIdRef.current,
        type,
        message: msg,
      });
    } else if (attemptIdRef.current) {
      // Fallback: HTTP API
      logSecurityEvent(attemptIdRef.current, type, msg).catch(console.error);
    }
  }, []);

  // Manual DevTools Check (chỉ chạy khi anti-cheat bật theo .env)
  useEffect(() => {
    if (isAntiCheatDisabledByEnv || isMockExamMode || isExamDevMode) return;
    const check = () => {
      const threshold = 160;
      const blocked = window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold;
      setIsDevToolsBlocked(blocked);
    };
    const interval = setInterval(check, 1000);
    window.addEventListener("resize", check);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", check);
    };
  }, []);

  // --- ANTI-CHEAT: FORCED ENABLE (Không check .env) ---
  // Luôn bật khi đã bắt đầu làm bài và chưa nộp
  const antiCheatEnabled = !isSubmitted && hasStarted;

  // Log debug để verify
  useEffect(() => {
    if (hasStarted) {
      console.log("[AntiCheat FORCED] Status:", {
        enabled: antiCheatEnabled,
        reason: { hasStarted, isSubmitted, override: "FORCE_ENABLED" },
      });
    }
  }, [hasStarted, antiCheatEnabled, isSubmitted]);

  const { isFullScreen, enterFullScreen, exitFullScreen, violations, toggleBlockingOverlaySecure, setPaused } = useAntiCheat({
    enable: antiCheatEnabled,
    onViolation: handleViolation,
    initialViolationsCount: serverViolationCount,
    maxViolations: test?.max_violations || 5,
  });

  // --- Handling Final Violation Button Click ---
  useEffect(() => {
    const handleForceFinish = () => {
      exitFullScreen();
      router.push(`/user/classes/${classId}`);
    };
    window.addEventListener("exam_force_submit", handleForceFinish);
    return () => window.removeEventListener("exam_force_submit", handleForceFinish);
  }, [exitFullScreen, router, classId]);

  // --- 2. SUBMIT & ROBOTIC ACTIONS ---
  const handleRoboticSubmit = useCallback(
    async (reason: string) => {
      if (isSubmittedRef.current) return;
      console.warn("Robotic Submit Triggered:", reason);

      setIsSubmitted(true);
      isSubmittedRef.current = true;

      try {
        if (attemptIdRef.current && studentId) {
          const finalAnswers = sanitizeAnswers(latestAnswersRef.current);
          await submitExamAttempt(attemptIdRef.current, studentId, finalAnswers);
        }
      } catch (e) {
        console.error("Robotic submit failed:", e);
      }

      // Nếu là lỗi vi phạm Anti-Cheat, Overlay đã hiển thị thông báo "Bị khóa".
      // Ta không cần hiện thêm SweetAlert nữa để tránh rối.
      if (reason === "CHEATING_LIMIT_EXCEEDED") {
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Bài thi đã kết thúc",
        text: reason,
        allowOutsideClick: false,
        confirmButtonText: "Đã hiểu",
      }).then(() => {
        exitFullScreen();
        router.push(`/user/classes/${classId}`);
      });
    },
    [classId, router, studentId, exitFullScreen],
  );

  const handleSubmit = useCallback(async () => {
    if (!attemptId || !test) return;

    // Validation
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < test.questions.length) {
      const confirm = await Swal.fire({
        title: "Chưa hoàn thành?",
        text: `Bạn mới làm ${answeredCount}/${test.questions.length} câu. Nộp bài?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Nộp luôn",
        cancelButtonText: "Làm tiếp",
      });
      if (!confirm.isConfirmed) return;
    } else {
      const confirm = await Swal.fire({
        title: "Xác nhận nộp bài",
        text: "Bạn có chắc chắn muốn nộp bài thi?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Nộp bài",
        cancelButtonText: "Hủy",
      });
      if (!confirm.isConfirmed) return;
    }

    // Submit Process
    setIsSubmitted(true);
    Swal.fire({ title: "Đang nộp bài...", didOpen: () => Swal.showLoading() });

    try {
      if (!isMockExamMode) {
        const finalAnswers = sanitizeAnswers(userAnswers);
        await submitExamAttempt(attemptId, studentId!, finalAnswers);
      } else {
        await new Promise((r) => setTimeout(r, 1000));
      }
      localStorage.removeItem(`ATTEMPT_${examId}`);

      await Swal.fire({
        icon: "success",
        title: "Nộp bài thành công!",
        timer: 2000,
        showConfirmButton: false,
      });
      exitFullScreen();
      router.push(`/user/classes/${classId}`);
    } catch (error: any) {
      setIsSubmitted(false);
      Swal.fire("Lỗi", error.message || "Nộp bài thất bại", "error");
    }
  }, [attemptId, test, studentId, userAnswers, examId, classId, router, exitFullScreen]);

  // Lock user limits
  useEffect(() => {
    if (test && violations.length >= (test.max_violations || 5)) {
      handleRoboticSubmit("CHEATING_LIMIT_EXCEEDED");
    }
  }, [violations.length, test, handleRoboticSubmit]);

  // --- 3. SOCKET LOGIC (Direct Connection to Exam Server) ---
  const connectSocket = useCallback(
    (aid: string) => {
      // If already connected to the same attempt, do nothing
      if (socketRef.current?.connected && attemptIdRef.current === aid) return;

      // Disconnect existing if any
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Config URL - default to localhost:5000 if not set, or use specific Env var for Exam Server
      const examServerUrl = process.env.NEXT_PUBLIC_EXAM_SERVER_URL || "http://localhost:5000";
      console.log("[ExamSocket] Connecting to:", examServerUrl, "for attempt:", aid);

      const socket = io(examServerUrl, {
        path: "/socket.io", // Standard Socket.IO path
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000,
        query: {
          attempt_id: aid,
          user_id: String(studentId),
        },
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("[ExamSocket] Connected!", socket.id);
        setSocketConnected(true);
        // Explicit join attempt event
        socket.emit("join_attempt", { attemptId: aid });
      });

      socket.on("connect_error", (err: any) => {
        console.error("[ExamSocket] Connection Error:", err.message);
        setSocketConnected(false);
      });

      socket.on("disconnect", (reason: any) => {
        console.warn("[ExamSocket] Disconnected:", reason);
        setSocketConnected(false);
      });

      // --- Exam Specific Events ---

      // 1. Time Sync
      socket.on("time_sync", (data: { remaining_seconds: number }) => {
        if (data && typeof data.remaining_seconds === "number") {
          const svTime = Math.max(0, data.remaining_seconds);
          setRemainingSeconds((prev) => {
            // If local timer drift is > 2s, sync with server
            if (prev === null || Math.abs(prev - svTime) > 2) return svTime;
            return prev;
          });
        }
      });

      // 2. Time Up - Auto Submit
      socket.on("time_up", () => {
        console.warn("[ExamSocket] Time Up event received.");
        handleRoboticSubmit("Hết giờ làm bài (Server confirmed).");
      });

      // 3. Force Submit / Kick
      socket.on("force_submit", (data: { reason: string }) => {
        handleRoboticSubmit(data.reason || "Giáo viên yêu cầu nộp bài.");
      });
    },
    [handleRoboticSubmit, studentId],
  );

  // --- 4. DATA LOADING & START PROCESS ---

  // A. Load Test Detail ONLY (Initial Load)
  const loadTestDetail = useCallback(async () => {
    if (isMockExamMode) {
      setTest(createMockTest(examId));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getRagTestDetail(examId);
      setTest(data);
    } catch (error: any) {
      setSystemAlert("Không thể tải đề thi: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    loadTestDetail();
  }, [loadTestDetail]);

  // B. Start / Resume Logic
  const startExamProcess = useCallback(async () => {
    if (!studentId || !test) return;

    // 1. Trigger Fullscreen IMMEDIATELY (Before Async Logic)
    try {
      await enterFullScreen();
    } catch (e) {
      console.error("Fullscreen blocked:", e);
      message.warning("Vui lòng cho phép chế độ Toàn màn hình để làm bài.");
    }

    setLoading(true);

    if (isMockExamMode) {
      setAttemptId("mock-attempt");
      setRemainingSeconds((test.duration_minutes || 30) * 60);
      setHasStarted(true);
      setLoading(false);
      return;
    }

    try {
      // 2. Call API Start (Server Timer Starts Here)
      const attempt = await startExamAttempt(examId, classId, studentId);
      setServerViolationCount(attempt.violation_count || 0);
      setAttemptId(attempt.attempt_id);
      localStorage.setItem(`ATTEMPT_${examId}`, attempt.attempt_id);

      if (attempt.resumed && attempt.answers && test.questions) {
        const normalized = normalizeResumedAnswers(attempt.answers, test.questions);
        setUserAnswers(normalized);
      }

      setHasStarted(true); // UI Switch to Exam Main
      // Khởi tạo đồng hồ ngay (server sẽ sync qua time_sync khi socket connect)
      const initialSeconds = (test.duration_minutes || 15) * 60;
      setRemainingSeconds(initialSeconds);
    } catch (error: any) {
      console.error(error);
      exitFullScreen(); // Revert Fullscreen if start failed
      setSystemAlert(error.message || "Không thể bắt đầu phiên làm bài.");
    } finally {
      setLoading(false);
    }
  }, [examId, classId, studentId, test, enterFullScreen, exitFullScreen, message]);

  // Đếm ngược local mỗi giây (server time_sync sẽ override nếu có)
  useEffect(() => {
    if (!hasStarted || isSubmitted || remainingSeconds === null) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 0) return prev;
        return Math.max(0, prev - 1);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isSubmitted, remainingSeconds === null]);

  // Khi đồng hồ về 0 → tự động nộp bài
  useEffect(() => {
    if (hasStarted && !isSubmitted && remainingSeconds === 0) {
      handleRoboticSubmit("Hết giờ làm bài.");
    }
  }, [hasStarted, isSubmitted, remainingSeconds, handleRoboticSubmit]);

  // Socket Lifecycle
  useEffect(() => {
    if (hasStarted && attemptId && !isSubmitted) {
      connectSocket(attemptId);
    }
    return () => {
      if (socketRef.current) {
        console.log("[ExamSocket] Cleaning up socket...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [hasStarted, attemptId, isSubmitted, connectSocket]);

  // Heartbeat & Auto-Save Loop
  useEffect(() => {
    if (!hasStarted || isSubmitted || !attemptId) return;

    const interval = setInterval(() => {
      if (socketRef.current?.connected) {
        // Heartbeat
        socketRef.current.emit("heartbeat", { attemptId });

        // Auto Save Answers
        const answersToSave = latestAnswersRef.current;
        socketRef.current.emit("save_answers", {
          attemptId,
          answers: answersToSave,
        });
      }
    }, 5000); // 5s interval

    return () => clearInterval(interval);
  }, [hasStarted, isSubmitted, attemptId]);

  // --- Interaction ---
  const handleSelectOption = useCallback(
    (qId: string, opt: string) => {
      setUserAnswers((prev) => {
        const next = { ...prev };
        if (!opt) delete next[qId];
        else next[qId] = opt;
        return next;
      });
      if (socketRef.current?.connected && attemptId) {
        socketRef.current.emit("save_answers", { attemptId, answers: { ...userAnswers, [qId]: opt } });
      }
    },
    [attemptId, userAnswers],
  );

  const toggleFlag = useCallback((qId: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  }, []);

  return {
    test,
    loading,
    remainingSeconds,
    socketConnected,
    isSubmitted,
    hasStarted,
    currentQuestion: test?.questions?.[currentPage],
    totalQuestions: test?.questions?.length || 0,
    currentPage,
    userAnswers,
    flaggedQuestions,
    violations,
    isFullScreen,
    showSplash: loading,
    systemAlert,
    isDevToolsBlocked,
    // Actions
    setCurrentPage,
    handleSelectOption,
    userId: studentId,
    toggleFlag,
    handleSubmit,
    enterFullScreen,
    exitFullScreen,
    handleReconnect: () => connectSocket(attemptId!),
    startExam: startExamProcess, // Replaced
    // Helpers
    formatTime: (s: number) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec < 10 ? "0" : ""}${sec}`;
    },
    progressPercent: test?.questions?.length ? Math.round((Object.keys(userAnswers).length / test.questions.length) * 100) : 0,
    timeProgressPercent:
      test?.duration_minutes && remainingSeconds !== null ? Math.round(100 - (remainingSeconds / (test.duration_minutes * 60)) * 100) : 0,
  };
}
