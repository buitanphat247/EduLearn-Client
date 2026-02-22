"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { App, Button, ConfigProvider, theme, Progress, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { getVocabulariesByFolder, getDueWords, getVocabularyDetail, getVocabularyBatch, type VocabularyResponse } from "@/lib/api/vocabulary";
import { getSubscriptionStatus } from "@/lib/api/subscription";
import { useTheme } from "@/app/context/ThemeContext";
import { useVocabularyTyping } from "@/app/hooks/useVocabularyTyping";
import TypingHeader from "@/app/components/features/vocabulary/TypingHeader";
import TypingQuestionCard from "@/app/components/features/vocabulary/TypingQuestionCard";
import QuizResultCard from "@/app/components/features/vocabulary/QuizResultCard";

export default function VocabularyTyping() {
  const { message } = App.useApp();
  const router = useRouter();
  const params = useParams();
  const folderIdString = params?.folderId as string;
  const folderId = folderIdString === "review" ? "review" : (folderIdString ? parseInt(folderIdString, 10) : null);
  const { theme: currentTheme } = useTheme();

  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const isMountedRef = useRef(true);

  const {
    questions,
    currentQuestionIndex,
    userInput,
    setUserInput,
    userAnswers,
    showResult,
    score,
    isChecking,
    currentQuestion,
    placeholder,
    progress,
    inputRef,
    generateQuestions,
    playAudio,
    handleCheck,
    handleNext,
    handlePrev,
    handleRestart,
  } = useVocabularyTyping(vocabularies);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { getProfile } = await import("@/lib/api/auth");
        const profile = await getProfile();
        if (isMountedRef.current && profile?.user_id) {
          setUserId(Number(profile.user_id));
        }
      } catch (error) {
        if (isMountedRef.current) console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const fetchVocabularies = async () => {
    if (!folderId) return;

    setLoading(true);
    try {
      let data: any[];
      if (folderId === "review") {
        if (!userId) {
          if (isMountedRef.current) setLoading(false);
          return;
        }
        const [sub, res] = await Promise.all([
          getSubscriptionStatus().catch(() => ({ isPro: false })),
          getDueWords(userId, { limit: 20 }),
        ]);
        const allowed = sub?.isPro ? res.data : (res.data || []).filter((x: any) => !x.folder_pro);

        if (allowed.length > 0) {
          const sourceWordIds = allowed.map((item: any) => item.sourceWordId);
          const details = await getVocabularyBatch(sourceWordIds);

          data = allowed.map((item: any) => {
            const detail = details.find((d: any) => d.sourceWordId === item.sourceWordId);
            return {
              ...(detail || item.vocabulary),
              sourceWordId: item.sourceWordId,
              nextReviewAt: item.next_review_at,
              last_grade: item.last_grade,
              repetition: item.repetition
            };
          });
        } else {
          data = [];
        }
      } else {
        data = await getVocabulariesByFolder(folderId as number);
      }
      if (!isMountedRef.current) return;
      setVocabularies(data);
      if (data.length > 0) {
        generateQuestions(data);
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 403 || status === 404) {
        if (status === 404) {
          message.warning("Không tìm thấy thư mục từ vựng.");
        } else {
          message.warning(error?.response?.data?.message || "Bạn cần gói Pro để truy cập từ vựng.");
        }
        router.replace("/vocabulary");
        return;
      }
      if (isMountedRef.current) {
        console.error("Error fetching vocabularies:", error);
        message.error(error?.message || "Không thể tải danh sách từ vựng");
        setVocabularies([]);
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (folderId === "review") {
      if (userId) fetchVocabularies();
    } else if (folderId) {
      fetchVocabularies();
    }
  }, [folderId, userId]);

  const folderName = useMemo(() => {
    if (folderId === "review") return "Ôn tập tổng hợp";
    return vocabularies[0]?.folder?.folderName || "";
  }, [vocabularies, folderId]);

  if (!folderId) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-slate-500">Folder ID không hợp lệ</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="h-full bg-slate-50 dark:bg-[#0f172a] py-8 text-slate-800 dark:text-slate-200 transition-colors duration-500">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Spin size="large" tip="Đang tải câu hỏi..." />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="h-full bg-slate-50 dark:bg-[#0f172a] py-8 text-slate-800 dark:text-slate-200 transition-colors duration-500">
        <div className="container mx-auto px-4">
          <div className="text-center py-24 bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 mb-4">Chưa có đủ từ vựng để luyện tập.</p>
            <Button type="primary" onClick={() => router.push(folderId === "review" ? "/vocabulary/review/detail" : `/vocabulary/${folderId}`)}>
              Quay lại {folderId === "review" ? "ôn tập" : "danh sách"}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const hasSubmitted = userAnswers[currentQuestionIndex] !== undefined;
  const isCorrect = userAnswers[currentQuestionIndex]?.isCorrect;

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#3b82f6",
        },
      }}
    >
      <main className="h-full bg-slate-50 dark:bg-[#0f172a] py-8 text-slate-800 dark:text-slate-200 transition-colors duration-500">
        <div className="mx-auto px-4 container">
          <TypingHeader
            folderId={folderId}
            folderName={folderName}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            score={score}
            showResult={showResult}
          />

          {/* Progress Bar */}
          {!showResult && (
            <div className="mb-8">
              <Progress
                percent={progress}
                strokeColor={{
                  "0%": "#3b82f6",
                  "100%": "#8b5cf6",
                }}
                showInfo={false}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>
                  Câu {currentQuestionIndex + 1} / {questions.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          )}

          {/* Typing Content */}
          {showResult ? (
            <QuizResultCard
              score={score}
              totalQuestions={questions.length}
              onRestart={handleRestart}
              onBack={() => router.push(folderId === "review" ? "/vocabulary/review/detail" : `/vocabulary/${folderId}`)}
            />
          ) : currentQuestion ? (
            <div className="space-y-6">
              <TypingQuestionCard
                word={currentQuestion.word}
                sentence={currentQuestion.sentence}
                placeholder={placeholder}
                userInput={userInput}
                hasSubmitted={hasSubmitted}
                isCorrect={isCorrect}
                isChecking={isChecking}
                onInputChange={setUserInput}
                onCheck={handleCheck}
                onPlayAudio={playAudio}
                inputRef={inputRef}
              />

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  size="large"
                  className="h-12 px-6 border-slate-300 dark:border-slate-600"
                >
                  Câu trước
                </Button>

                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>

                <Button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1 || !hasSubmitted}
                  size="large"
                  className="h-12 px-6 bg-blue-600 hover:bg-blue-700 border-0 text-white"
                >
                  Câu sau
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </ConfigProvider>
  );
}
