"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { App, ConfigProvider, theme } from "antd";
import { LeftOutlined, RightOutlined, SoundOutlined, SwapOutlined } from "@ant-design/icons";
import { getVocabulariesByFolder, type VocabularyResponse } from "@/lib/api/vocabulary";
import { IoArrowBackOutline } from "react-icons/io5";
import VocabularyFlashcardSkeleton from "@/app/components/features/vocabulary/VocabularyFlashcardSkeleton";
import { useTheme } from "@/app/context/ThemeContext";
import { sanitizeForDisplay } from "@/lib/utils/sanitize";

type ReviewLevel = "again" | "hard" | "good" | "easy";

export default function VocabularyFlashcard() {
  const { message } = App.useApp();
  const router = useRouter();
  const params = useParams();
  const folderId = params?.folderId ? parseInt(params.folderId as string, 10) : null;
  const { theme: currentTheme } = useTheme();

  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewLevels, setReviewLevels] = useState<Record<number, ReviewLevel>>({});
  const [isFlipped, setIsFlipped] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Lấy thông tin User Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { getProfile } = await import("@/lib/api/auth");
        const profile = await getProfile();
        if (profile?.user_id) {
          setUserId(Number(profile.user_id));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // Map last_grade -> ReviewLevel: 1->again, 2->hard, 3->good, 5->easy
  const gradeToLevel = useCallback((grade: number | null): ReviewLevel | undefined => {
    if (grade == null) return undefined;
    if (grade === 1) return "again";
    if (grade === 2) return "hard";
    if (grade === 3) return "good";
    if (grade >= 4) return "easy";
    return "again";
  }, []);

  const fetchVocabularies = useCallback(async () => {
    if (!folderId) return;

    setLoading(true);
    try {
      const data = await getVocabulariesByFolder(folderId);
      setVocabularies(data);
      setCurrentIndex(0);
      setIsFlipped(false);
      setReviewLevels({});
    } catch (error: any) {
      console.error("Error fetching vocabularies:", error);
      message.error(error?.message || "Không thể tải danh sách từ vựng");
      setVocabularies([]);
      setReviewLevels({});
    } finally {
      setLoading(false);
    }
  }, [folderId, message]);

  useEffect(() => {
    if (folderId) fetchVocabularies();
  }, [folderId, fetchVocabularies]);

  // Load trạng thái đã học của user để hiển thị đúng nút đã chọn
  useEffect(() => {
    if (!userId || vocabularies.length === 0) return;

    const loadBatch = async () => {
      const { getBatchUserVocabulary } = await import("@/lib/api/vocabulary");
      const batch = await getBatchUserVocabulary(
        userId,
        vocabularies.map((v) => v.sourceWordId),
      );
      const loaded: Record<number, ReviewLevel> = {};
      batch.forEach((item) => {
        const level = gradeToLevel(item.last_grade);
        if (level) loaded[item.sourceWordId] = level;
      });
      setReviewLevels(loaded);
    };
    loadBatch();
  }, [userId, vocabularies, gradeToLevel]);

  const folderName = useMemo(() => vocabularies[0]?.folder?.folderName || "", [vocabularies]);
  const currentVocab = useMemo(() => (vocabularies.length > 0 ? vocabularies[currentIndex] : null), [vocabularies, currentIndex]);

  // Reset flip khi chuyển thẻ
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const playAudio = useCallback(
    (audioUrl?: string) => {
      if (!audioUrl) {
        message.warning("Không có audio cho từ này");
        return;
      }
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        message.error("Không thể phát audio");
      });
    },
    [message]
  );

  const handlePrev = useCallback(() => {
    if (vocabularies.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev === 0 ? vocabularies.length - 1 : prev - 1));
  }, [vocabularies.length]);

  const handleNext = useCallback(() => {
    if (vocabularies.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev === vocabularies.length - 1 ? 0 : prev + 1));
  }, [vocabularies.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Map ReviewLevel -> grade: again->1, hard->2, good->3, easy->5
  const levelToGrade: Record<ReviewLevel, number> = {
    again: 1,
    hard: 2,
    good: 3,
    easy: 5,
  };

  const levelLabels: Record<ReviewLevel, string> = {
    again: "Học lại",
    hard: "Khó",
    good: "Tốt",
    easy: "Dễ",
  };

  const handleSetReviewLevel = useCallback(
    async (level: ReviewLevel) => {
      if (!currentVocab || !userId || isProcessing) return;

      setIsProcessing(true);

      // Play ping sound
      try {
        const pingAudio = new Audio("/audio/ping.mp3");
        pingAudio.volume = 0.2;
        pingAudio.currentTime = 0;
        await pingAudio.play();
      } catch (err) {
        console.error("Error playing ping sound:", err);
      }

      try {
        const { reviewWord, createUserVocabulary } = await import("@/lib/api/vocabulary");
        setReviewLevels((prev) => ({ ...prev, [currentVocab.sourceWordId]: level }));

        await createUserVocabulary({
          user_id: userId,
          sourceWordId: currentVocab.sourceWordId,
        });

        await reviewWord({
          user_id: userId,
          sourceWordId: currentVocab.sourceWordId,
          grade: levelToGrade[level],
        });

        message.success(`Đã ghi nhận: ${levelLabels[level]}`);

        if (currentIndex < vocabularies.length - 1) {
          setTimeout(() => handleNext(), 500);
        }
      } catch (error) {
        console.error("Error reviewing word:", error);
        message.error("Không thể lưu kết quả ôn tập");
      } finally {
        setTimeout(() => setIsProcessing(false), 500); // Debounce duration
      }
    },
    [currentVocab, userId, currentIndex, vocabularies.length, handleNext, message]
  );

  const parseExample = useCallback((exampleStr: string) => {
    try {
      if (!exampleStr) return null;
      const parsed = JSON.parse(exampleStr);
      return {
        content: parsed.content || "",
        translation: parsed.translation || "",
      };
    } catch {
      return null;
    }
  }, []);

  const parsedExample = useMemo(() => {
    if (!currentVocab?.example) return null;
    return parseExample(currentVocab.example);
  }, [currentVocab?.example, parseExample]);

  if (!folderId) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-slate-500">Folder ID không hợp lệ</p>
        </div>
      </main>
    );
  }

  // Use Skeleton if loading, and maybe update Skeleton to be theme-aware too if not already
  if (loading) {
    return <VocabularyFlashcardSkeleton />;
  }

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
        <div className="container mx-auto px-4">
          {/* Header & Breadcrumb */}
          <div className="mb-8">
            <div className="mb-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl px-6 py-4 shadow-sm text-sm font-medium flex items-center flex-wrap gap-2 transition-colors">
              <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                Trang chủ
              </Link>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <Link href="/vocabulary" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                Học từ vựng
              </Link>
              {folderName && (
                <>
                  <span className="text-slate-400 dark:text-slate-600">/</span>
                  <Link href={`/vocabulary/${folderId}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                    {folderName}
                  </Link>
                  <span className="text-slate-400 dark:text-slate-600">/</span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Flashcard</span>
                </>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 transition-colors">
                  Chế độ Flashcard <span className="text-slate-400 dark:text-slate-600 font-light">|</span> {folderName}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  {vocabularies.length > 0 ? `Thẻ thứ ${currentIndex + 1} trên tổng số ${vocabularies.length} từ` : "Đang tải danh sách từ vựng..."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/vocabulary/${folderId}`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-0 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                <IoArrowBackOutline className="text-lg" />
                Quay lại danh sách
              </button>
            </div>
          </div>

          {vocabularies.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700 transition-colors">
              <p className="text-slate-500 dark:text-slate-400 mb-4">Chưa có từ vựng nào trong folder này.</p>
              <button
                type="button"
                onClick={() => router.push(`/vocabulary/${folderId}`)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                Thêm từ vựng ngay
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Flashcard */}
              {currentVocab && (
                <div
                  className="w-full max-w-3xl mb-10"
                  style={{
                    perspective: "1000px",
                    perspectiveOrigin: "center center"
                  }}
                >
                  <div
                    className="relative w-full min-h-[450px] cursor-pointer"
                    style={{
                      transformStyle: "preserve-3d",
                      transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                    onClick={handleFlip}
                  >
                    {/* Front Face */}
                    <div
                      className="absolute inset-0 bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl shadow-blue-900/5 dark:shadow-black/20 border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center hover:shadow-blue-900/10 dark:hover:shadow-black/30"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(0deg)",
                        transformStyle: "preserve-3d",
                      }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight transition-colors">{currentVocab.content}</h2>
                        {currentVocab.audioUrl?.[0]?.url && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playAudio(currentVocab.audioUrl![0].url);
                            }}
                            className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <SoundOutlined className="text-xl" />
                          </button>
                        )}
                      </div>

                      <p className="text-xl text-slate-500 dark:text-slate-400 font-mono mb-8 transition-colors">/{currentVocab.pronunciation}/</p>

                      <div className="text-sm text-slate-400 dark:text-slate-500 mt-4 flex items-center gap-2">
                        <SwapOutlined />
                        <span>Click để lật thẻ</span>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div
                      className="absolute inset-0 bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl shadow-blue-900/5 dark:shadow-black/20 border border-blue-200 dark:border-blue-500/30 p-8 flex flex-col text-center hover:shadow-blue-900/10 dark:hover:shadow-black/30"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        transformStyle: "preserve-3d",
                      }}
                    >
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-700 transition-colors">
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">{currentVocab.content}</h2>
                        {currentVocab.audioUrl?.[0]?.url && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playAudio(currentVocab.audioUrl![0].url);
                            }}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <SoundOutlined />
                          </button>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center">
                        <p className="text-4xl text-blue-600 dark:text-blue-400 font-bold mb-4 transition-colors">{currentVocab.translation}</p>

                        {currentVocab.pos && (
                          <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-lg uppercase tracking-wider mb-6 border border-slate-200 dark:border-slate-700 transition-colors">
                            {currentVocab.pos}
                          </span>
                        )}

                        {/* Mini Example Preview */}
                        {parsedExample && (
                          <div className="max-w-lg mx-auto bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm border border-slate-100 dark:border-slate-700/50 transition-colors">
                            <p className="text-slate-700 dark:text-slate-300 italic mb-1" dangerouslySetInnerHTML={{ __html: sanitizeForDisplay(parsedExample.content) }} />
                            <p className="text-slate-500" dangerouslySetInnerHTML={{ __html: sanitizeForDisplay(parsedExample.translation) }} />
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-slate-400 dark:text-slate-500 mt-4 flex items-center gap-2">
                        <SwapOutlined />
                        <span>Click để lật lại</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="w-full max-w-3xl">
                <div className="flex justify-around items-center mb-8 gap-4">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={vocabularies.length <= 1 || isProcessing}
                    className={`h-14 w-14 min-w-14 rounded-2xl flex items-center justify-center bg-linear-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 text-white shadow-md transition-all ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                  >
                    <LeftOutlined className="text-lg" />
                  </button>
                  <div className="px-6 py-3 rounded-2xl bg-linear-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                    <span className="text-lg font-bold text-white tabular-nums tracking-widest">
                      {String(currentIndex + 1).padStart(2, "0")} <span className="text-white/70 font-medium">/</span> {String(vocabularies.length).padStart(2, "0")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={vocabularies.length <= 1 || isProcessing}
                    className={`h-14 w-14 min-w-14 rounded-2xl flex items-center justify-center bg-linear-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 text-white shadow-md transition-all ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                  >
                    <RightOutlined className="text-lg" />
                  </button>
                </div>

                {/* Review Level Buttons - Học lại, Khó, Tốt, Dễ */}
                <div className="flex flex-wrap justify-center gap-6">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleSetReviewLevel("again")}
                    className={`flex flex-col items-center justify-center w-24 py-3 rounded-xl font-semibold border transition-all duration-200 ${currentVocab && reviewLevels[currentVocab.sourceWordId] === "again"
                      ? "bg-red-100 border-red-500 text-red-600 dark:bg-red-900/30 dark:border-red-500/50 dark:text-red-400 shadow-md transform scale-105"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                      } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span>Học lại</span>
                    <span className="text-xs font-medium opacity-70">30m</span>
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleSetReviewLevel("hard")}
                    className={`flex flex-col items-center justify-center w-24 py-3 rounded-xl font-semibold border transition-all duration-200 ${currentVocab && reviewLevels[currentVocab.sourceWordId] === "hard"
                      ? "bg-orange-100 border-orange-500 text-orange-600 dark:bg-orange-900/30 dark:border-orange-500/50 dark:text-orange-400 shadow-md transform scale-105"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span>Khó</span>
                    <span className="text-xs font-medium opacity-70">12h</span>
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleSetReviewLevel("good")}
                    className={`flex flex-col items-center justify-center w-24 py-3 rounded-xl font-semibold border transition-all duration-200 ${currentVocab && reviewLevels[currentVocab.sourceWordId] === "good"
                      ? "bg-blue-100 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500/50 dark:text-blue-400 shadow-md transform scale-105"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span>Tốt</span>
                    <span className="text-xs font-medium opacity-70">1d</span>
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleSetReviewLevel("easy")}
                    className={`flex flex-col items-center justify-center w-24 py-3 rounded-xl font-semibold border transition-all duration-200 ${currentVocab && reviewLevels[currentVocab.sourceWordId] === "easy"
                      ? "bg-green-100 border-green-500 text-green-600 dark:bg-green-900/30 dark:border-green-500/50 dark:text-green-400 shadow-md transform scale-105"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                      } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span>Dễ</span>
                    <span className="text-xs font-medium opacity-70">3d</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </ConfigProvider>
  );
}
