"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { App, Spin, Button, Tag, ConfigProvider, theme } from "antd";
import { LeftOutlined, RightOutlined, RollbackOutlined, SoundOutlined, SwapOutlined } from "@ant-design/icons";
import { getVocabulariesByFolder, type VocabularyResponse } from "@/lib/api/vocabulary";
import { IoArrowBackOutline } from "react-icons/io5";
import VocabularyFlashcardSkeleton from "@/app/components/features/vocabulary/VocabularyFlashcardSkeleton";

type Difficulty = "easy" | "medium" | "hard";

export default function VocabularyFlashcard() {
  const { message } = App.useApp();
  const router = useRouter();
  const params = useParams();
  const folderId = params?.folderId ? parseInt(params.folderId as string, 10) : null;

  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [difficulties, setDifficulties] = useState<Record<number, Difficulty>>({});
  const [isFlipped, setIsFlipped] = useState(false);

  const fetchVocabularies = useCallback(async () => {
    if (!folderId) return;

    const startTime = Date.now();
    setLoading(true);
    try {
      const data = await getVocabulariesByFolder(folderId);

      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 200;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      setVocabularies(data);
      setCurrentIndex(0);
      setDifficulties({});
      setIsFlipped(false);
    } catch (error: any) {
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 200;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

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

  if (loading) {
    return <VocabularyFlashcardSkeleton />;
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#3b82f6",
        },
      }}
    >
      <main className="min-h-screen bg-[#0f172a] py-8 md:py-12 text-slate-200">
        <div className="container mx-auto px-4">
          {/* Header & Breadcrumb */}
          <div className="mb-8">
            <div className="mb-6 bg-[#1e293b] border border-slate-700/50 rounded-xl px-6 py-4 shadow-sm text-sm font-medium flex items-center flex-wrap gap-2">
              <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
                Trang chủ
              </Link>
              <span className="text-slate-600">/</span>
              <Link href="/features/vocabulary" className="text-blue-400 hover:text-blue-300 transition-colors">
                Học từ vựng
              </Link>
              {folderName && (
                <>
                  <span className="text-slate-600">/</span>
                  <Link href={`/features/vocabulary/${folderId}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                    {folderName}
                  </Link>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-300 font-medium">Flashcard</span>
                </>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Chế độ Flashcard <span className="text-slate-600 font-light">|</span> {folderName}
                </h1>
                <p className="text-slate-400">
                  {vocabularies.length > 0 ? `Thẻ thứ ${currentIndex + 1} trên tổng số ${vocabularies.length} từ` : "Đang tải danh sách từ vựng..."}
                </p>
              </div>

              <Button
                icon={<IoArrowBackOutline />}
                onClick={() => router.push(`/features/vocabulary/${folderId}`)}
                size="small"
                className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-0 text-white font-medium shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all duration-300 hover:scale-105"
              >
                Quay lại danh sách
              </Button>
            </div>
          </div>

          {vocabularies.length === 0 ? (
            <div className="text-center py-24 bg-[#1e293b] rounded-3xl border border-slate-700">
              <p className="text-slate-400 mb-4">Chưa có từ vựng nào trong folder này.</p>
              <Button type="primary" onClick={() => router.push(`/features/vocabulary/${folderId}`)}>
                Thêm từ vựng ngay
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Flashcard */}
              {currentVocab && (
                <div className="w-full max-w-3xl mb-10 group" style={{ perspective: "1000px" }}>
                  <div
                    className="relative w-full min-h-[450px]"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Front Face */}
                    <div
                      className="absolute inset-0 bg-[#1e293b] rounded-3xl shadow-2xl shadow-black/20 border border-slate-700 p-8 flex flex-col items-center justify-center text-center transition-transform duration-300 ease-in-out"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-5xl font-extrabold text-white tracking-tight">{currentVocab.content}</h2>
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
                            className="text-slate-400 hover:text-blue-400 hover:bg-slate-800 flex items-center justify-center"
                          />
                        )}
                      </div>

                      <p className="text-xl text-slate-400 font-mono mb-8">/{currentVocab.pronunciation}/</p>

                      <Button
                        type="primary"
                        icon={<SwapOutlined />}
                        size="small"
                        onClick={handleFlip}
                        className="bg-blue-600 h-12 px-8 rounded-full shadow-lg shadow-blue-900/40 hover:scale-105 transition-transform border-none"
                      >
                        Lật thẻ xem nghĩa
                      </Button>
                    </div>

                    {/* Back Face */}
                    <div
                      className="absolute inset-0 bg-[#1e293b] rounded-3xl shadow-2xl shadow-black/20 border border-blue-500/30 p-8 flex flex-col text-center transition-transform duration-300 ease-in-out"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-700">
                        <h2 className="text-3xl font-bold text-white">{currentVocab.content}</h2>
                        {currentVocab.audioUrl?.[0]?.url && (
                          <Button
                            type="text"
                            icon={<SoundOutlined />}
                            onClick={() => playAudio(currentVocab.audioUrl![0].url)}
                            className="text-slate-400 hover:text-blue-400"
                          />
                        )}
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center">
                        <p className="text-4xl text-blue-400 font-bold mb-4">{currentVocab.translation}</p>

                        {currentVocab.pos && (
                          <span className="inline-block px-3 py-1 bg-slate-800 text-slate-300 text-sm font-semibold rounded-lg uppercase tracking-wider mb-6 border border-slate-700">
                            {currentVocab.pos}
                          </span>
                        )}

                        {/* Mini Example Preview */}
                        {parsedExample && (
                          <div className="max-w-lg mx-auto bg-slate-800/50 p-4 rounded-xl text-sm border border-slate-700/50">
                            <p className="text-slate-300 italic mb-1" dangerouslySetInnerHTML={{ __html: parsedExample.content }} />
                            <p className="text-slate-500" dangerouslySetInnerHTML={{ __html: parsedExample.translation }} />
                          </div>
                        )}
                      </div>

                      <Button
                        type="default"
                        icon={<SwapOutlined />}
                        size="small"
                        onClick={handleFlip}
                        className="mt-8 self-center bg-transparent border-slate-600 text-slate-400 hover:text-blue-400 hover:border-blue-400"
                      >
                        Xem mặt trước
                      </Button>
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
                      size="small"
                      disabled={vocabularies.length <= 1}
                      className="h-12 bg-[#1e293b] border-slate-700 text-slate-300 hover:text-blue-400 hover:border-blue-400 hover:bg-slate-800"
                    >
                      Trước
                    </Button>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-500 tabular-nums tracking-widest">
                      {String(currentIndex + 1).padStart(2, "0")} / {String(vocabularies.length).padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <Button
                      icon={<RightOutlined />}
                      iconPosition="end"
                      onClick={handleNext}
                      size="small"
                      disabled={vocabularies.length <= 1}
                      className="h-12 bg-[#1e293b] border-slate-700 text-slate-300 hover:text-blue-400 hover:border-blue-400 hover:bg-slate-800"
                    >
                      Tiếp
                    </Button>
                  </div>
                </div>

                {/* Difficulty Rating */}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Đánh giá độ khó</p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleSetDifficulty("easy")}
                      size="small"
                      className={`h-10 px-6 bg-[#1e293b] border-slate-700 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/50 ${
                        difficulties[currentVocab!.sourceWordId] === "easy" ? "bg-emerald-500/20 border-emerald-500" : ""
                      }`}
                    >
                      Dễ
                    </Button>
                    <Button
                      onClick={() => handleSetDifficulty("medium")}
                      size="small"
                      className={`h-10 px-6 bg-[#1e293b] border-slate-700 text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/50 ${
                        difficulties[currentVocab!.sourceWordId] === "medium" ? "bg-blue-500/20 border-blue-500" : ""
                      }`}
                    >
                      Trung bình
                    </Button>
                    <Button
                      onClick={() => handleSetDifficulty("hard")}
                      size="small"
                      className={`h-10 px-6 bg-[#1e293b] border-slate-700 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/50 ${
                        difficulties[currentVocab!.sourceWordId] === "hard" ? "bg-rose-500/20 border-rose-500" : ""
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
