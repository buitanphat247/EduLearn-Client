"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Empty, App, Modal, ConfigProvider, theme, Button } from "antd";
import Swal from "sweetalert2";
import io, { Socket } from "socket.io-client";
import { getRagTestDetail, type RagTestDetail, type RagQuestion } from "@/lib/api/rag-exams";
import { startExamAttempt, submitExamAttempt, logSecurityEvent } from "@/lib/api/exam-attempts";
import { ExamHeader, QuestionCard, QuestionGrid } from "./components";
import { useAntiCheat } from "@/app/hooks/useAntiCheat";
import DataLoadingSplash from "@/app/components/common/DataLoadingSplash";
import RouteErrorBoundary from "@/app/components/common/RouteErrorBoundary";

const QUESTIONS_PER_PAGE = 5;

export default function ExamSessionPage() {
  const params = useParams();
  const classId = params.id as string;
  const examId = params.examId as string;
  const router = useRouter();

  // Use global App message context
  const { message, modal } = App.useApp();

  // State
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<RagTestDetail | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [studentId, setStudentId] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDevToolsBlocked, setIsDevToolsBlocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [serverViolationCount, setServerViolationCount] = useState(0);
  const [showRules, setShowRules] = useState(false);
  const [systemAlert, setSystemAlert] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const hasStartedRef = useRef(false);
  const isSubmittedRef = useRef(false);
  const socketRef = useRef<any>(null);
  const latestAnswersRef = useRef<Record<string, string>>({});
  const latestViolationsRef = useRef<any[]>([]);

  // Sync refs with state for non-reactive handlers
  useEffect(() => {
    isSubmittedRef.current = isSubmitted;
  }, [isSubmitted]);

  const isDevToolsOpen = () => {
    const threshold = 160;
    return window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold;
  };

  // Memoize onViolation to prevent useAntiCheat effects from re-running unnecessarily
  const handleViolation = useCallback(
    (type: string, message: string) => {
      if (attemptId && !isSubmitted) {
        logSecurityEvent(attemptId, type, message);
      }
    },
    [attemptId, isSubmitted]
  );

  // Anti-Cheat (API Based Logging)
  const { enterFullScreen, exitFullScreen, isFullScreen, violations, setPaused, toggleBlockingOverlaySecure } = useAntiCheat({
    enable: !!attemptId && !isSubmitted && hasStarted, // Start ONLY when button clicked, Stop when submitted
    onViolation: handleViolation,
    initialViolationsCount: serverViolationCount,
  });

  // Sync refs with state for non-reactive handlers (NOW DECLARED AFTER HOOKS)
  useEffect(() => {
    latestViolationsRef.current = violations;
  }, [violations]);

  useEffect(() => {
    latestAnswersRef.current = userAnswers;
  }, [userAnswers]);

  const connectSocket = useCallback(
    (aid: string) => {
      if (socketRef.current) socketRef.current.disconnect();
      const flaskBaseUrl = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://localhost:5000";
      const socket = (io as any).default ? (io as any).default(flaskBaseUrl) : io(flaskBaseUrl);
      socketRef.current = socket;
      socket.emit("join_attempt", { attemptId: aid });

      socket.on("time_sync", (data: { remaining_seconds: number }) => {
        if (!isSubmitted && data && data.remaining_seconds !== undefined) {
          setRemainingSeconds(data.remaining_seconds);
        }
      });

      socket.on("time_up", () => {
        setIsSubmitted(true);
        Swal.fire({
          icon: "info",
          title: "Hết giờ làm bài!",
          text: "Hệ thống đang tự động nộp bài...",
          timer: 2000,
          showConfirmButton: false,
          allowOutsideClick: false,
        }).then(() => {
          exitFullScreen();
          router.push(`/user/classes/${classId}`);
        });
      });

      socket.on("disconnect", (reason: string) => {
        // "MÁY MÓC": Chỉ xử lý nếu không phải do app chủ động ngắt (unmount/submit)
        if (hasStartedRef.current && !isSubmittedRef.current && reason !== "io client disconnect") {
          handleRoboticTermination("Dòng điện/Kết nối bị ngắt - Hệ thống đã nộp bài và kết thúc lượt thi của bạn.");
        }
      });
    },
    [classId, router, exitFullScreen, isSubmitted]
  );

  // Hàm xử lý "Không tình người": Nộp bài và đá văng ngay lập tức
  const handleRoboticTermination = useCallback(
    async (reason: string) => {
      if (isSubmittedRef.current) return;

      setIsSubmitted(true);
      isSubmittedRef.current = true;
      setPaused(true);

      // 1. Cố gắng gọi API nộp bài VỚI DỮ LIỆU MỚI NHẤT TỪ REFS (Tránh mất bài)
      if (attemptId) {
        submitExamAttempt(attemptId, studentId, latestAnswersRef.current).catch(console.error);
        localStorage.removeItem(`ATTEMPT_${examId}`);
      }

      // 2. Chuyển sang màn hình khóa tĩnh, loại bỏ mọi tương tác
      setSystemAlert(reason);
      setHasStarted(false);
      hasStartedRef.current = false;

      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      exitFullScreen();
    },
    [attemptId, studentId, userAnswers, examId, exitFullScreen]
  );

  // 1. Fetch Test Detail & Start/Resume Attempt
  useEffect(() => {
    let active = true;

    const initSession = async () => {
      if (hasStartedRef.current) return;

      setLoading(true);

      // DevTools Check
      if (isDevToolsOpen()) {
        if (active) {
          setIsDevToolsBlocked(true);
          setLoading(false);
        }
        return;
      }
      if (active) setIsDevToolsBlocked(false);

      try {
        // 1. GET REAL USER ID FIRST (Crucial for attempt check in getRagTestDetail)
        let realStudentId = 0;
        const cookieUserId = document.cookie.split("; ").find((row) => row.startsWith("user_id="));
        if (cookieUserId) {
          realStudentId = parseInt(cookieUserId.split("=")[1]);
        }
        if (!realStudentId) {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            try {
              const u = JSON.parse(userStr);
              realStudentId = Number(u.id || u.user_id);
            } catch (e) {}
          }
        }
        if (!realStudentId) throw new Error("Vui lòng đăng nhập lại.");
        if (active) setStudentId(realStudentId);

        // 2. Fetch Test Detail WITH student_id for server-side attempt check
        const data = await getRagTestDetail(examId, realStudentId);
        if (!data) throw new Error("Không tìm thấy đề thi");
        if (active) setTest(data);

        // START/RESUME Attempt
        const attempt = await startExamAttempt(examId, classId, realStudentId);
        if (active) {
          setServerViolationCount(attempt.violation_count || 0);

          // 3. Handle Resume vs New Start
          setAttemptId(attempt.attempt_id);

          const hasQuestions = data.questions && data.questions.length > 0;

          if (attempt.resumed) {
            if (attempt.answers) setUserAnswers(attempt.answers);
          }

          if (hasQuestions) {
            // ALWAYS show gateway to capture user gesture for fullscreen & provide a bridge
            setShowRules(true);
          }

          localStorage.setItem(`ATTEMPT_${examId}`, attempt.attempt_id);
        }
      } catch (error: any) {
        console.error(error);
        if (active) {
          setLoading(false);
          setShowRules(false); // Dọn dẹp bảng quy tắc nếu có lỗi
          // Dùng bảng thông báo lỗi tĩnh, không hiệu ứng bay nhảy
          setSystemAlert(error.message || "Không thể bắt đầu lượt thi");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initSession();

    // 2s Splash Screen minimum duration
    const splashTimer = setTimeout(() => {
      if (active) setShowSplash(false);
    }, 2000);

    return () => {
      active = false;
      clearTimeout(splashTimer);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [examId, classId, router, connectSocket, enterFullScreen, toggleBlockingOverlaySecure, message]); // Only depend on core route params

  // Heartbeat & Timer (Sync with Server)
  useEffect(() => {
    if (!test || !attemptId || isSubmitted || !socketRef.current) return;

    // 1. Local Countdown (Fluid UI)
    const timerInterval = setInterval(() => {
      setRemainingSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000);

    // 2. Heartbeat (Sync with Server every 10s)
    const heartbeatInterval = setInterval(() => {
      if (socketRef.current) {
        socketRef.current.emit("heartbeat", { attemptId });
      }
    }, 10000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(heartbeatInterval);
    };
  }, [test, attemptId, isSubmitted]);

  // Anti-Cheat Lock (Dynamic Violations)
  useEffect(() => {
    const limit = test?.max_violations || 3;
    if (violations.length >= limit && !isSubmitted && attemptId) {
      // Silent Background Submit
      const finalizeExam = async () => {
        setIsSubmitted(true);
        setPaused(true);
        try {
          await submitExamAttempt(attemptId, studentId, userAnswers);
          localStorage.removeItem(`ATTEMPT_${examId}`);
        } catch (e) {
          console.error(e);
        }
      };
      finalizeExam();
    }
  }, [violations.length, isSubmitted, attemptId, studentId, userAnswers, examId, test]);

  // 3. Chế độ "MÁY MÓC": Đóng tab hoặc rời đi = Nộp bài ngay lập tực
  useEffect(() => {
    const handleNoMercyExit = () => {
      if (hasStartedRef.current && !isSubmittedRef.current) {
        // Nếu cố tình đóng tab hoặc ẩn trang -> Coi như kết thúc
        handleRoboticTermination("Hành động rời khỏi trang thi đã bị ghi nhận là nộp bài sớm.");
      }
    };

    // Theo dõi việc ẩn tab hoặc đóng tab
    window.addEventListener("pagehide", handleNoMercyExit);

    return () => {
      window.removeEventListener("pagehide", handleNoMercyExit);
    };
  }, [handleRoboticTermination]);

  // 4. Handle Redirection from Locked Overlay
  useEffect(() => {
    const handleLockedExit = () => {
      exitFullScreen();
      router.push(`/user/classes/${classId}`);
    };
    window.addEventListener("exam_locked_exit", handleLockedExit);
    return () => window.removeEventListener("exam_locked_exit", handleLockedExit);
  }, [classId, router, exitFullScreen]);

  // Computed values
  const totalPages = useMemo(() => {
    if (!test) return 0;
    return Math.ceil(test.questions.length / QUESTIONS_PER_PAGE);
  }, [test]);

  const currentQuestions = useMemo(() => {
    if (!test) return [];
    const start = currentPage * QUESTIONS_PER_PAGE;
    return test.questions.slice(start, start + QUESTIONS_PER_PAGE);
  }, [test, currentPage]);

  const score = useMemo(() => {
    // User requested to show "Answered Count" instead of "Correct Score"
    return Object.keys(userAnswers).length;
  }, [userAnswers]);

  const progressPercent = useMemo(() => {
    if (!test || test.questions.length === 0) return 0;
    const answeredCount = Object.keys(userAnswers).length;
    return Math.round((answeredCount / test.questions.length) * 100);
  }, [test, userAnswers]);

  // Handlers
  const handleSelectOption = useCallback(
    (questionId: string, option: string) => {
      setUserAnswers((prev) => {
        const newAnswers = {
          ...prev,
          [questionId]: option,
        };

        // AUTO-SAVE via Socket
        if (socketRef.current && attemptId) {
          socketRef.current.emit("save_answers", {
            attemptId,
            answers: newAnswers,
          });
        }

        return newAnswers;
      });
    },
    [attemptId]
  );

  const toggleFlag = useCallback((questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newFlags = new Set(prev);
      if (newFlags.has(questionId)) {
        newFlags.delete(questionId);
      } else {
        newFlags.add(questionId);
      }
      return newFlags;
    });
  }, []);

  const handleExit = useCallback(() => {
    if (isSubmitted) {
      localStorage.removeItem(`ATTEMPT_${examId}`);
      exitFullScreen();
      router.push(`/user/classes/${classId}`);
      return;
    }

    setPaused(true);
    modal.confirm({
      title: "Bạn muốn thoát bài thi?",
      content: "Kết quả làm bài sẽ không được lưu nếu bạn thoát ngay bây giờ.",
      okText: "Thoát ngay",
      cancelText: "Ở lại",
      okButtonProps: { danger: true },
      zIndex: 20000,
      onOk: () => {
        setIsSubmitted(true); // Ngăn chặn trigger robotic termination khi đang thoát
        isSubmittedRef.current = true;
        localStorage.removeItem(`ATTEMPT_${examId}`);
        exitFullScreen();
        router.push(`/user/classes/${classId}`);
      },
      onCancel: () => {
        setPaused(false);
      },
    });
  }, [isSubmitted, examId, classId, router, modal, exitFullScreen, setPaused]);

  const handleSubmit = useCallback(() => {
    if (!attemptId || !studentId || !test) {
      message.error("Dữ liệu không hoàn chỉnh. Vui lòng tải lại trang.");
      return;
    }

    if (Object.keys(userAnswers).length < test.questions.length) {
      Swal.fire({
        icon: "warning",
        title: "Chưa hoàn thành bài thi",
        text: `Bạn mới làm được ${Object.keys(userAnswers).length}/${test.questions.length} câu. Vui lòng hoàn tất tất cả câu hỏi.`,
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    setPaused(true);

    Swal.fire({
      title: "Xác nhận nộp bài?",
      text: "Bạn có chắc chắn muốn kết thúc bài thi ngay bây giờ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Nộp bài",
      cancelButtonText: "Hủy",
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        try {
          const result = await submitExamAttempt(attemptId, studentId, latestAnswersRef.current);
          if (!result) throw new Error("Nộp bài thất bại");

          setIsSubmitted(true); // Đánh dấu đã nộp ngay lập tức để chặn socket/pagehide
          isSubmittedRef.current = true;

          await new Promise((resolve) => setTimeout(resolve, 800)); // Smooth transition
          return result;
        } catch (error: any) {
          Swal.showValidationMessage(`Lỗi: ${error.message || "Không thể nộp bài"}`);
          return false;
        }
      },
    }).then((resultSwal) => {
      if (resultSwal.isConfirmed && resultSwal.value) {
        localStorage.removeItem(`ATTEMPT_${examId}`);
        exitFullScreen();
        router.push(`/user/classes/${classId}`);
      } else {
        setPaused(false);
      }
    });
  }, [attemptId, studentId, test, userAnswers, examId, classId, router, exitFullScreen, setPaused, message]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // DevTools Blocked State UI
  if (isDevToolsBlocked) {
    return (
      <div className="w-full h-[calc(100vh-64px)] bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100 flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-4xl animate-pulse">⚠️</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Phát hiện DevTools!</h2>
            <p className="text-gray-600">Hệ thống phát hiện bạn đang mở công cụ lập trình (Developer Tools). Vui lòng đóng nó để tiếp tục bài thi.</p>
          </div>
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => {
                hasStartedRef.current = false;
                setLoading(true);
                // Trigger re-init via effect by cycling loading if needed,
                // but here we just call the logic again or rely on the effect.
                // Re-running initSession logic:
                window.location.reload();
              }}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Tôi đã đóng, bắt đầu làm bài
            </button>
            <button
              onClick={handleExit}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Quay lại sau
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 0. Premium Splash Screen (First Priority)
  if (showSplash) {
    return <DataLoadingSplash tip="Đang tải dữ liệu..." />;
  }

  // 1. System Alert Overlay (Giao diện đơn giản cũ - Tĩnh)
  if (systemAlert) {
    return (
      <div className="fixed inset-0 z-2147483647 bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full flex flex-col items-center text-center">
          <Empty imageStyle={{ height: 120 }} description={null} />
          <h2 className="text-xl font-bold text-gray-800 mt-2 mb-4 tracking-tight uppercase">Thông báo hệ thống</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6 px-6 font-medium italic">"{systemAlert}"</p>
          <Button
            onClick={() => {
              exitFullScreen();
              router.push(`/user/classes/${classId}`);
            }}
            type="primary"
            className="px-8 bg-indigo-600 rounded-lg font-bold"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  // 2. Initial Loading - Use DataLoadingSplash
  if (loading && !test && !isSubmitted) {
    return <DataLoadingSplash tip="Đang chuẩn bị phiên làm bài..." />;
  }

  // 4. Detailed Loading - Use DataLoadingSplash
  if (loading && !isSubmitted) {
    return <DataLoadingSplash tip="Đang tải dữ liệu..." />;
  }

  // 5. Empty state
  if (!test || !test.questions || test.questions.length === 0) {
    return (
      <div className="w-full h-[calc(100vh-64px)] bg-gray-50 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Empty description="Không tìm thấy bài thi" />
        <Button onClick={handleExit} className="bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <RouteErrorBoundary routeName="exam">
      <>
      <div
        id="exam-fullscreen-root"
        className="w-full h-screen flex flex-col select-none bg-gray-50 overflow-hidden"
        style={{
          opacity: test?.questions?.length > 0 ? 1 : 0,
          pointerEvents: hasStarted ? "auto" : "none",
          filter: showRules ? "blur(20px) brightness(0.9) saturate(1.1)" : "none",
          transition: "filter 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease",
          animation: hasStarted && !showRules ? "exam-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "none",
        }}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <ExamHeader
          onExit={handleExit}
          progressPercent={progressPercent}
          elapsedTime={formatTime(remainingSeconds || 0)}
          score={score}
          totalQuestions={test.questions.length}
          isFullScreen={isFullScreen}
          onToggleFullScreen={isFullScreen ? exitFullScreen : enterFullScreen}
        />

        <main className="flex-1 flex gap-2 overflow-hidden">
          {/* Questions List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {currentQuestions.map((question, idx) => {
              const questionNumber = currentPage * QUESTIONS_PER_PAGE + idx + 1;
              return (
                <QuestionCard
                  key={question.id}
                  question={question}
                  questionNumber={questionNumber}
                  selectedAnswer={userAnswers[question.id]}
                  isFlagged={flaggedQuestions.has(question.id)}
                  onSelectOption={handleSelectOption}
                  onToggleFlag={toggleFlag}
                  readOnly={isSubmitted}
                />
              );
            })}
          </div>

          <QuestionGrid
            questions={test.questions}
            userAnswers={userAnswers}
            flaggedQuestions={flaggedQuestions}
            currentPage={currentPage}
            totalPages={totalPages}
            questionsPerPage={QUESTIONS_PER_PAGE}
            onPageChange={setCurrentPage}
            onSubmit={isSubmitted ? handleExit : handleSubmit}
            violations={violations}
            isSubmitted={isSubmitted}
          />
        </main>

        <style jsx>{`
          @keyframes exam-reveal {
            0% {
              opacity: 0;
              transform: translateY(20px) scale(0.98);
              filter: blur(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0);
            }
          }
          @keyframes rules-pop-up {
            0% {
              transform: translateY(40px) scale(0.95);
              opacity: 0;
            }
            100% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>

      {/* Examinee Gateway - Cánh cửa bắt đầu trên nền mờ */}
      {showRules && !systemAlert && (
        <div className="fixed inset-0 z-2147483647 bg-slate-900/20 backdrop-blur-md flex items-center justify-center p-6">
          <div
            style={{ animation: "rules-pop-up 0.5s cubic-bezier(0.25, 1, 0.5, 1)" }}
            className="max-w-xl w-full bg-white/95 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border border-white/50 p-10 flex flex-col items-center backdrop-blur-2xl"
          >
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-100 mb-8 animate-in zoom-in duration-500">
              <span className="text-white text-3xl font-black tracking-tighter">AIO</span>
            </div>

            <div className="w-full text-left mb-8">
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                NỘI QUY PHÒNG THI
              </h2>
              <div className="h-0.5 w-12 bg-indigo-100 rounded-full mt-1.5 ml-4"></div>
            </div>

            <div className="w-full space-y-4 mb-10 text-left">
              {[
                "Làm bài ở chế độ TOÀN MÀN HÌNH.",
                "KHÔNG chuyển sang Tab khác hoặc thoát trình duyệt.",
                `Vi phạm quá ${test?.max_violations || 3} lần hệ thống sẽ tự động khóa bài.`,
                "Tuyệt đối không sử dụng công cụ DevTools.",
                "Bài thi sẽ được tự động nộp khi hết thời gian.",
              ].map((rule, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>

            <Button
              type="primary"
              onClick={() => {
                setShowRules(false);
                setHasStarted(true);
                hasStartedRef.current = true;
                connectSocket(attemptId!);
                enterFullScreen();
              }}
              className="h-14 bg-indigo-600 hover:bg-indigo-700 border-none rounded-xl font-black text-base shadow-xl shadow-indigo-100 uppercase tracking-widest"
              block
            >
              Tôi đã hiểu & Bắt đầu
            </Button>
          </div>
        </div>
      )}
      </>
    </RouteErrorBoundary>
  );
}
