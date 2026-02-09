"use client";

import { useReducer, useMemo, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { App, Button, ConfigProvider, theme } from "antd";
import RouteErrorBoundary from "@/app/components/common/RouteErrorBoundary";
import { useTheme } from "@/app/context/ThemeContext";
import WritingPracticeSkeleton from "@/app/components/features/writing/WritingPracticeSkeleton";
import WritingPracticeHeader from "../components/WritingPracticeHeader";
import WritingPracticeContent from "../components/WritingPracticeContent";
import WritingPracticeControls from "../components/WritingPracticeControls";
import WritingPracticeInput from "../components/WritingPracticeInput";

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

  // Custom hooks
  const { data, loading, currentIndex, setCurrentIndex } = useWritingData(id);
  const { formattedTime, start: startTimer } = useTimer(false);
  const { updateProgress } = useWritingProgress(id);

  // State management with useReducer
  const [state, dispatch] = useReducer(writingPracticeReducer, initialWritingState);

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

  const handleToggleHint = useCallback(() => {
    dispatch({ type: "TOGGLE_HINT" });
  }, []);

  const handleToggleTranscript = useCallback(() => {
    dispatch({ type: "TOGGLE_TRANSCRIPT" });
  }, []);

  const handleToggleTranslation = useCallback(() => {
    dispatch({ type: "TOGGLE_TRANSLATION" });
  }, []);

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
            />

            {/* Content - 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <WritingPracticeContent
                vietnameseSentences={vietnameseSentences}
                currentSentenceIndex={currentIndex}
              />

              <WritingPracticeControls
                englishSentences={englishSentences}
                vietnameseSentences={vietnameseSentences}
                currentSentenceIndex={currentIndex}
                showTranscript={state.showTranscript}
                showTranslation={state.showTranslation}
                completedSentences={state.completedSentences}
                revealedWordIndices={state.revealedWordIndices}
                onToggleTranscript={handleToggleTranscript}
                onToggleTranslation={handleToggleTranslation}
              />
            </div>

            <WritingPracticeInput
              userTranslation={state.userTranslation}
              showHint={state.showHint}
              currentEnglishSentence={currentEnglishSentence}
              onTranslationChange={handleTranslationChange}
              onToggleHint={handleToggleHint}
              onCheck={handleCheck}
            />
          </div>
        </main>
      </ConfigProvider>
    </RouteErrorBoundary>
  );
}
