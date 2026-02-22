"use client";

import { useReducer, useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { App, Button, ConfigProvider, theme } from "antd";
import RouteErrorBoundary from "@/app/components/common/RouteErrorBoundary";
import { useTheme } from "@/app/context/ThemeContext";
import WritingPracticeSkeleton from "@/app/components/features/writing/WritingPracticeSkeleton";
import WritingPracticeHeader from "../components/WritingPracticeHeader";
import WritingPracticeContent from "../components/WritingPracticeContent";
import WritingPracticeControls from "../components/WritingPracticeControls";
import WritingPracticeInput from "../components/WritingPracticeInput";
import WritingPracticeInfo from "../components/WritingPracticeInfo";
import { getWritingHint } from "@/lib/api/writing";
import { getUsageStatusForFeature, type FeatureUsageStatus } from "@/lib/api/subscription";

// Custom hooks
import { useTimer, useWritingData, useWritingProgress } from "../hooks";

// State management
import {
  writingPracticeReducer,
  initialWritingState,
} from "../state/writingPracticeReducer";

// Business logic
import { checkTranslation } from "../utils/writingHelpers";

export default function WritingPracticePage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const { theme: currentTheme } = useTheme();
  const id = params?.id as string;

  // Validate ID before using
  if (!id || id === "undefined" || id === "null") {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center transition-colors duration-500">
        <div className="text-center text-slate-800 dark:text-white">
          <p className="text-lg mb-4">ID bài luyện tập không hợp lệ</p>
          <Button type="primary" onClick={() => router.push("/writing")}>
            Quay lại
          </Button>
        </div>
      </main>
    );
  }

  // Custom hooks
  const { data, loading, currentIndex, setCurrentIndex } = useWritingData(id);
  const { formattedTime, start: startTimer } = useTimer(false);
  const { updateProgress } = useWritingProgress(id);

  // State management with useReducer
  const [state, dispatch] = useReducer(writingPracticeReducer, initialWritingState);
  const [hintUsage, setHintUsage] = useState<FeatureUsageStatus | null>(null);

  // Fetch hint usage limit theo gói when data is ready
  useEffect(() => {
    if (!data) return;
    getUsageStatusForFeature("ai_writing_hint")
      .then(setHintUsage)
      .catch(() => setHintUsage({ allowed: false, currentCount: 0, limit: 0 }));
  }, [data]);

  // Start timer when data is loaded
  useEffect(() => {
    if (!loading && data) {
      startTimer();
    }
  }, [loading, data, startTimer]);

  // Reset revealed words when sentence changes
  useEffect(() => {
    dispatch({ type: "RESET_REVEALED_WORDS" });
  }, [currentIndex]);

  // No data state refs
  const currentIndexRef = useRef(currentIndex);
  const hintRequestInFlightRef = useRef(false);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Memoized data
  const vietnameseSentences = useMemo(() => data?.vietnameseSentences || [], [data?.vietnameseSentences]);
  const englishSentences = useMemo(() => data?.englishSentences || [], [data?.englishSentences]);
  const currentEnglishSentence = useMemo(
    () => englishSentences[currentIndex] || "",
    [englishSentences, currentIndex]
  );

  // Event handlers
  const handleTranslationChange = useCallback((value: string) => {
    dispatch({ type: "SET_TRANSLATION", payload: value });
  }, []);

  const handleToggleHint = useCallback(async () => {
    // If hint modal is currently open, just close it
    if (state.showHint) {
      dispatch({ type: "TOGGLE_HINT" });
      return;
    }

    // Check cache first - avoid duplicate API calls (saves tokens!)
    const cached = state.hintCache.get(currentIndex);
    if (cached) {
      dispatch({ type: "LOAD_CACHED_HINT", payload: currentIndex });
      dispatch({ type: "TOGGLE_HINT" });
      return;
    }

    // Block double-click / Strict Mode double-invoke: only one hint request at a time
    if (hintRequestInFlightRef.current) return;
    hintRequestInFlightRef.current = true;

    const currentVietnamese = vietnameseSentences[currentIndex];
    const currentEnglish = englishSentences[currentIndex] || "";
    if (!currentVietnamese) {
      hintRequestInFlightRef.current = false;
      return;
    }

    const indexAtRequest = currentIndex;

    dispatch({ type: "SET_HINT_LOADING", payload: true });
    dispatch({ type: "TOGGLE_HINT" });

    try {
      const hintResult = await getWritingHint({
        practiceId: id,
        sentenceIndex: currentIndex,
        originalSentence: currentVietnamese,
        targetSentence: currentEnglish,
        targetLanguage: "English",
      });

      dispatch({
        type: "SET_HINT_DATA",
        payload: {
          sentenceIndex: indexAtRequest,
          data: {
            vocabulary: hintResult.vocabulary,
            structure: hintResult.structure,
          },
          currentViewIndex: currentIndexRef.current,
        },
      });
      // Cập nhật lượt còn lại sau khi dùng gợi ý
      getUsageStatusForFeature("ai_writing_hint").then(setHintUsage).catch(() => {});
    } catch (error: any) {
      console.error("Hint API error:", error);
      message.error(error?.message || "Không thể tạo gợi ý. Vui lòng thử lại.");
      dispatch({ type: "SET_HINT_LOADING", payload: false });
    } finally {
      hintRequestInFlightRef.current = false;
    }
  }, [state.showHint, state.hintCache, currentIndex, vietnameseSentences, englishSentences, id, message]);

  const handleCheck = useCallback(async () => {
    if (!state.userTranslation.trim()) {
      message.warning("Vui lòng nhập bản dịch của bạn");
      return;
    }

    if (!data) return;

    const targetSentence = englishSentences[currentIndex] || "";
    const { isCorrect, revealedIndices } = checkTranslation(state.userTranslation, targetSentence);

    if (isCorrect) {
      // Mark as completed
      dispatch({ type: "ADD_COMPLETED_SENTENCE", payload: currentIndex });
      dispatch({ type: "SET_REVEALED_WORDS", payload: revealedIndices });
      message.success("Chính xác!");

      // Move to next sentence after delay
      setTimeout(async () => {
        if (currentIndex < (data.totalSentences || 0) - 1) {
          const nextIndex = currentIndex + 1;

          try {
            await updateProgress(nextIndex);
            setCurrentIndex(nextIndex);
            dispatch({ type: "RESET_FOR_NEXT_SENTENCE" });
          } catch (error) {
            console.error("Error updating progress:", error);
          }
        } else {
          // Completed all sentences
          try {
            await updateProgress(data.totalSentences || 0);
            message.success("Bạn đã hoàn thành bài luyện tập!");
          } catch (error) {
            console.error("Error updating final progress:", error);
          }
        }
      }, 500);
    } else {
      // Partially correct - merge revealed words
      dispatch({ type: "MERGE_REVEALED_WORDS", payload: revealedIndices });
      message.error("Chưa chính xác, hãy thử lại!");
    }
  }, [
    state.userTranslation,
    data,
    englishSentences,
    currentIndex,
    message,
    updateProgress,
    setCurrentIndex,
  ]);

  // Loading state
  if (loading) {
    return <WritingPracticeSkeleton />;
  }

  // No data state
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
    <RouteErrorBoundary routeName="writing">
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
              currentSentenceIndex={currentIndex}
              totalSentences={data.totalSentences}
              contentType={data.contentType}
            />

            <WritingPracticeInfo data={data} />

            {/* Content - 2 Column Layout (PARAGRAPH = full width, no transcript) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <WritingPracticeContent
                vietnameseSentences={vietnameseSentences}
                currentSentenceIndex={currentIndex}
                contentType={data.contentType}
              />

              <WritingPracticeControls
                englishSentences={englishSentences}
                currentSentenceIndex={currentIndex}
                completedSentences={state.completedSentences}
                revealedWordIndices={state.revealedWordIndices}
                showHint={state.showHint}
                hintData={state.hintData}
                hintLoading={state.hintLoading}
                onToggleHint={handleToggleHint}
                hintUsage={hintUsage}
              />
            </div>

            <WritingPracticeInput
              userTranslation={state.userTranslation}
              currentEnglishSentence={currentEnglishSentence}
              onTranslationChange={handleTranslationChange}
              onCheck={handleCheck}
            />
          </div>
        </main>
      </ConfigProvider>
    </RouteErrorBoundary>
  );
}
