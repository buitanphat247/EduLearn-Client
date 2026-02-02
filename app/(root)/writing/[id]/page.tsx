"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { App, Button, ConfigProvider, theme } from "antd";
import {
  getWritingHistoryById,
  updateWritingHistoryIndex,
  type WritingGenerateResponse,
} from "@/lib/api/writing";
import { useTheme } from "@/app/context/ThemeContext";
import WritingPracticeSkeleton from "@/app/components/features/writing/WritingPracticeSkeleton";
import WritingPracticeHeader from "../components/WritingPracticeHeader";
import WritingPracticeContent from "../components/WritingPracticeContent";
import WritingPracticeControls from "../components/WritingPracticeControls";
import WritingPracticeInput from "../components/WritingPracticeInput";

// Utility function: normalize text for comparison
const normalizeForComparison = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export default function WritingPracticePage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const { theme: currentTheme } = useTheme();
  const id = params?.id as string;

  const [data, setData] = useState<WritingGenerateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userTranslation, setUserTranslation] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [completedSentences, setCompletedSentences] = useState<Set<number>>(new Set());
  const [showTranscript, setShowTranscript] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [revealedWordIndices, setRevealedWordIndices] = useState<Set<number>>(new Set());

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (!loading) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loading]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const formattedTime = useMemo(() => formatTime(timeElapsed), [formatTime, timeElapsed]);

  // Data loading effect
  useEffect(() => {
    if (!id) {
      message.error("Không tìm thấy ID bài luyện tập");
      router.push("/writing");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      const isHistoryId = /^\d+$/.test(id);

      if (isHistoryId) {
        try {
          const historyId = parseInt(id, 10);
          const response = await getWritingHistoryById(historyId);

          if (response.status === 200 && response.data) {
            const historyData = response.data;
            const contentData = historyData.data;
            const mappedData: WritingGenerateResponse = {
              id: contentData.id || id.toString(),
              language: contentData.language || "English",
              contentType: contentData.contentType || "DIALOGUE",
              difficulty: contentData.difficulty || 2,
              englishSentences: contentData.englishSentences || [],
              vietnameseSentences: contentData.vietnameseSentences || [],
              totalSentences: contentData.totalSentences || 0,
              userPoints: contentData.userPoints || 0,
              practiceType: contentData.practiceType || null,
              topic: contentData.topic || "",
            };

            setData(mappedData);

            if (historyData.current_index !== undefined && typeof historyData.current_index === "number") {
              setCurrentSentenceIndex(historyData.current_index);
            }
          } else {
            message.error(response.message || "Không tìm thấy dữ liệu bài luyện");
            router.push("/writing");
          }
        } catch (error: any) {
          console.error("Error fetching history:", error);
          message.error(error?.message || "Không thể tải dữ liệu bài luyện");
          router.push("/writing");
        }
      } else {
        const storedData = sessionStorage.getItem(`writing_${id}`);
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            const mappedData: WritingGenerateResponse = {
              id: parsed.id || id,
              language: parsed.language || "English",
              contentType: parsed.contentType || "DIALOGUE",
              difficulty: parsed.difficulty || 2,
              englishSentences: parsed.englishSentences || [],
              vietnameseSentences: parsed.vietnameseSentences || [],
              totalSentences: parsed.totalSentences || 0,
              userPoints: parsed.userPoints || 0,
              practiceType: parsed.practiceType || null,
              topic: parsed.topic || "",
            };

            setData(mappedData);

            if (parsed.current_index !== undefined && typeof parsed.current_index === "number") {
              setCurrentSentenceIndex(parsed.current_index);
            }
          } catch (e) {
            console.error("Error parsing stored data:", e);
            message.error("Không thể tải dữ liệu bài luyện");
            router.push("/writing");
          }
        } else {
          message.error("Không tìm thấy dữ liệu bài luyện. Vui lòng chọn lại từ danh sách.");
          router.push("/writing");
        }
      }
      setLoading(false);
    };

    loadData();
  }, [id, router, message]);

  // Reset revealed words when sentence changes
  useEffect(() => {
    setRevealedWordIndices(new Set());
  }, [currentSentenceIndex]);

  // Toggle handlers
  const toggleHint = useCallback(() => setShowHint((prev) => !prev), []);
  const toggleTranscript = useCallback(() => setShowTranscript((prev) => !prev), []);
  const toggleTranslation = useCallback(() => setShowTranslation((prev) => !prev), []);

  // Memoized data
  const memoizedVietnameseSentences = useMemo(() => data?.vietnameseSentences || [], [data?.vietnameseSentences]);
  const memoizedEnglishSentences = useMemo(() => data?.englishSentences || [], [data?.englishSentences]);
  const currentSentence = useMemo(() => data?.vietnameseSentences[currentSentenceIndex] || "", [data, currentSentenceIndex]);
  const currentEnglishSentence = useMemo(() => data?.englishSentences[currentSentenceIndex] || "", [data, currentSentenceIndex]);

  // Check handler
  const handleCheck = useCallback(() => {
    if (!userTranslation.trim()) {
      message.warning("Vui lòng nhập bản dịch của bạn");
      return;
    }

    if (!data) return;

    const targetSentence = data.englishSentences[currentSentenceIndex] || "";
    const targetContent = targetSentence.includes(":") ? targetSentence.split(":").slice(1).join(":").trim() : targetSentence;

    const normalizedInput = normalizeForComparison(userTranslation);
    const normalizedTarget = normalizeForComparison(targetContent);

    if (normalizedInput === normalizedTarget) {
      setCompletedSentences((prev) => new Set(prev).add(currentSentenceIndex));

      const targetWords = targetContent.split(/\s+/);
      const allIndices = new Set<number>();
      for (let i = 0; i < targetWords.length; i++) {
        allIndices.add(i);
      }
      setRevealedWordIndices(allIndices);

      message.success("Chính xác!");

      setTimeout(async () => {
        if (currentSentenceIndex < (data.totalSentences || 0) - 1) {
          const nextIndex = currentSentenceIndex + 1;
          const isHistoryId = /^\d+$/.test(id);

          if (isHistoryId) {
            try {
              const historyId = parseInt(id, 10);
              await updateWritingHistoryIndex(historyId, nextIndex);
            } catch (error: any) {
              console.error("Error updating current_index:", error);
            }
          } else {
            const storedData = sessionStorage.getItem(`writing_${id}`);
            if (storedData) {
              try {
                const parsed = JSON.parse(storedData);
                parsed.current_index = nextIndex;
                sessionStorage.setItem(`writing_${id}`, JSON.stringify(parsed));
              } catch (e) {
                console.error("Error updating sessionStorage:", e);
              }
            }
          }

          setCurrentSentenceIndex(nextIndex);
          setUserTranslation("");
          setShowHint(false);
          setRevealedWordIndices(new Set());
        } else {
          const isHistoryId = /^\d+$/.test(id);
          if (isHistoryId) {
            try {
              const historyId = parseInt(id, 10);
              const finalIndex = data.totalSentences || 0;
              await updateWritingHistoryIndex(historyId, finalIndex);
            } catch (error: any) {
              console.error("Error updating final current_index:", error);
            }
          }

          message.success("Bạn đã hoàn thành bài luyện tập!");
        }
      }, 1000);
    } else {
      const targetWords = targetContent.split(/\s+/);
      const userWords = userTranslation.trim().split(/\s+/);
      const newRevealedIndices = new Set<number>();

      targetWords.forEach((targetWord, idx) => {
        const cleanTarget = normalizeForComparison(targetWord);
        const cleanInput = userWords[idx] ? normalizeForComparison(userWords[idx]) : "";

        if (cleanTarget === cleanInput && cleanTarget.length > 0) {
          newRevealedIndices.add(idx);
        }
      });

      setRevealedWordIndices((prev) => {
        const merged = new Set(prev);
        newRevealedIndices.forEach((idx) => merged.add(idx));
        return merged;
      });

      message.error("Chưa chính xác, hãy thử lại!");
    }
  }, [userTranslation, data, currentSentenceIndex, id, message]);

  if (loading) {
    return <WritingPracticeSkeleton />;
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center transition-colors duration-500">
        <div className="text-center text-slate-800 dark:text-white">
          <p className="text-lg mb-4">Không tìm thấy dữ liệu bài luyện</p>
          <Button type="primary" onClick={() => router.push("/writing")}>
            Quay lại
          </Button>
        </div>
      </main>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#3b82f6",
          colorBgContainer: currentTheme === "dark" ? "#1e293b" : "#ffffff",
          colorBorder: currentTheme === "dark" ? "#334155" : "#e2e8f0",
        },
      }}
    >
      <main className="h-full bg-slate-50 dark:bg-[#0f172a] py-8 text-slate-800 dark:text-slate-200 transition-colors duration-500">
        <div className="container mx-auto px-4">
          <WritingPracticeHeader
            formattedTime={formattedTime}
            currentSentenceIndex={currentSentenceIndex}
            totalSentences={data.totalSentences}
          />

          {/* Content - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <WritingPracticeContent
              vietnameseSentences={memoizedVietnameseSentences}
              currentSentenceIndex={currentSentenceIndex}
            />

            <WritingPracticeControls
              englishSentences={memoizedEnglishSentences}
              vietnameseSentences={memoizedVietnameseSentences}
              currentSentenceIndex={currentSentenceIndex}
              showTranscript={showTranscript}
              showTranslation={showTranslation}
              completedSentences={completedSentences}
              revealedWordIndices={revealedWordIndices}
              onToggleTranscript={toggleTranscript}
              onToggleTranslation={toggleTranslation}
            />
          </div>

          <WritingPracticeInput
            userTranslation={userTranslation}
            showHint={showHint}
            currentEnglishSentence={currentEnglishSentence}
            onTranslationChange={setUserTranslation}
            onToggleHint={toggleHint}
            onCheck={handleCheck}
          />
        </div>
      </main>
    </ConfigProvider>
  );
}
