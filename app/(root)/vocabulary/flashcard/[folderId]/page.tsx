"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { App, Spin, Button, Tag, ConfigProvider, theme } from "antd";
import { LeftOutlined, RightOutlined, RollbackOutlined, SoundOutlined, SwapOutlined, ReloadOutlined } from "@ant-design/icons";
import { getVocabulariesByFolder, type VocabularyResponse } from "@/lib/api/vocabulary";
import { IoArrowBackOutline } from "react-icons/io5";
import VocabularyFlashcardSkeleton from "@/app/components/features/vocabulary/VocabularyFlashcardSkeleton";
import { useTheme } from "@/app/context/ThemeContext";
import { sanitizeForDisplay } from "@/lib/utils/sanitize";

type Difficulty = "easy" | "medium" | "hard";

export default function VocabularyFlashcard() {
  const { message } = App.useApp();
  const router = useRouter();
  const params = useParams();
  const folderId = params?.folderId ? parseInt(params.folderId as string, 10) : null;
  const { theme: currentTheme } = useTheme();

  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [difficulties, setDifficulties] = useState<Record<number, Difficulty>>({});
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoFlip, setAutoFlip] = useState(false);
  const [autoFlipDelay] = useState(3000); // 3 giây

  const fetchVocabularies = useCallback(async () => {
    if (!folderId) return;

    setLoading(true);
    try {
      const data = await getVocabulariesByFolder(folderId);

      setVocabularies(data);
      setCurrentIndex(0);
      setDifficulties({});
      setIsFlipped(false);
    } catch (error: any) {
      console.error("Error fetching vocabularies:", error);
      message.error(error?.message || "Không thể tải danh sách từ vựng");
      setVocabularies([]);
    } finally {
      setLoading(false);
    }
  }, [folderId, message]);

  useEffect(() => {
    if (folderId) {
      fetchVocabularies();
    }
  }, [folderId, fetchVocabularies]);

  const folderName = useMemo(() => vocabularies[0]?.folder?.folderName || "", [vocabularies]);
  const currentVocab = useMemo(() => (vocabularies.length > 0 ? vocabularies[currentIndex] : null), [vocabularies, currentIndex]);

  // Auto-flip effect
  useEffect(() => {
    if (!autoFlip || !currentVocab || vocabularies.length === 0) return;

    // Reset về mặt trước khi chuyển thẻ mới
    setIsFlipped(false);

    // Tự động lật sau delay
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, autoFlipDelay);

    return () => {
      clearTimeout(timer);
    };
  }, [autoFlip, currentIndex, currentVocab, vocabularies.length, autoFlipDelay]);

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

  const toggleAutoFlip = useCallback(() => {
    setAutoFlip((prev) => !prev);
    // Reset về mặt trước khi bật/tắt auto-flip
    setIsFlipped(false);
  }, []);

  const handleSetDifficulty = useCallback(
    (level: Difficulty) => {
      if (!currentVocab) return;
      setDifficulties((prev) => ({
        ...prev,
        [currentVocab.sourceWordId]: level,
      }));
    },
    [currentVocab]
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

              <Button
                icon={<IoArrowBackOutline />}
                onClick={() => router.push(`/vocabulary/${folderId}`)}
                size="middle"
                className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-0 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                Quay lại danh sách
              </Button>
            </div>
          </div>

          {vocabularies.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700 transition-colors">
              <p className="text-slate-500 dark:text-slate-400 mb-4">Chưa có từ vựng nào trong folder này.</p>
              <Button type="primary" onClick={() => router.push(`/vocabulary/${folderId}`)}>
                Thêm từ vựng ngay
              </Button>
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
                          <Button
                            type="text"
                            shape="circle"
                            icon={<SoundOutlined className="text-xl" />}
                            size="large"
                            onClick={(e) => {
                              e.stopPropagation();
                              playAudio(currentVocab.audioUrl![0].url);
                            }}
                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                          />
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
                          <Button
                            type="text"
                            icon={<SoundOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              playAudio(currentVocab.audioUrl![0].url);
                            }}
                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                          />
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
                <div className="flex justify-around items-center mb-8 ">
                  <div>
                    <Button
                      icon={<LeftOutlined />}
                      onClick={handlePrev}
                      size="middle"
                      disabled={vocabularies.length <= 1}
                      className="h-12 w-12 rounded-full flex items-center justify-center bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-400 shadow-sm transition-all"
                    />
                  </div>
                  <div>
                    <span className="text-base font-semibold text-slate-600 dark:text-slate-400 tabular-nums tracking-widest bg-white dark:bg-[#1e293b] px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                      {String(currentIndex + 1).padStart(2, "0")} / {String(vocabularies.length).padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <Button
                      icon={<RightOutlined />}
                      iconPosition="end"
                      onClick={handleNext}
                      size="middle"
                      disabled={vocabularies.length <= 1}
                      className="h-12 w-12 rounded-full flex items-center justify-center bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-400 shadow-sm transition-all"
                    />
                  </div>
                </div>

                {/* Auto-flip Toggle */}
                <div className="flex justify-center mb-6">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={toggleAutoFlip}
                    size="middle"
                    className={`h-10 px-6 rounded-full font-medium transition-all ${autoFlip
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 shadow-lg shadow-blue-500/30"
                      : "bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-400"
                      }`}
                  >
                    {autoFlip ? "Tắt tự động lật" : "Bật tự động lật"}
                  </Button>
                </div>

                {/* Difficulty Rating */}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Đánh giá độ khó</p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleSetDifficulty("easy")}
                      size="middle"
                      className={`h-10 px-6 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/50 font-medium transition-all ${difficulties[currentVocab!.sourceWordId] === "easy" ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 shadow-md ring-2 ring-emerald-500/20" : ""
                        }`}
                    >
                      Dễ
                    </Button>
                    <Button
                      onClick={() => handleSetDifficulty("medium")}
                      size="middle"
                      className={`h-10 px-6 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-300 dark:hover:border-blue-500/50 font-medium transition-all ${difficulties[currentVocab!.sourceWordId] === "medium" ? "bg-blue-50 dark:bg-blue-500/20 border-blue-500 shadow-md ring-2 ring-blue-500/20" : ""
                        }`}
                    >
                      Trung bình
                    </Button>
                    <Button
                      onClick={() => handleSetDifficulty("hard")}
                      size="middle"
                      className={`h-10 px-6 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-300 dark:hover:border-rose-500/50 font-medium transition-all ${difficulties[currentVocab!.sourceWordId] === "hard" ? "bg-rose-50 dark:bg-rose-500/20 border-rose-500 shadow-md ring-2 ring-rose-500/20" : ""
                        }`}
                    >
                      Khó
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </ConfigProvider>
  );
}
