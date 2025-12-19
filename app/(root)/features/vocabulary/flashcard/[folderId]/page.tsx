"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { App, Spin, Button, Tag } from "antd";
import { LeftOutlined, RightOutlined, RollbackOutlined, SoundOutlined, SwapOutlined } from "@ant-design/icons";
import { getVocabulariesByFolder, type VocabularyResponse } from "@/lib/api/vocabulary";
import Image from "next/image";

type Difficulty = "easy" | "medium" | "hard";

export default function VocabularyFlashcard() {
  const { message } = App.useApp();
  const router = useRouter();
  const params = useParams();
  const folderId = params?.folderId ? parseInt(params.folderId as string, 10) : null;

  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [folderName, setFolderName] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [difficulties, setDifficulties] = useState<Record<number, Difficulty>>({});
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (folderId) {
      fetchVocabularies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  const fetchVocabularies = async () => {
    if (!folderId) return;

    const startTime = Date.now();
    setLoading(true);
    try {
      const data = await getVocabulariesByFolder(folderId);

      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 250;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      setVocabularies(data);
      if (data.length > 0) {
        setFolderName(data[0].folder.folderName);
      }
      setCurrentIndex(0);
      setDifficulties({});
    } catch (error: any) {
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 250;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      console.error("Error fetching vocabularies:", error);
      message.error(error?.message || "Không thể tải danh sách từ vựng");
      setVocabularies([]);
    } finally {
      setLoading(false);
    }
  };

  const currentVocab = useMemo(
    () => (vocabularies.length > 0 ? vocabularies[currentIndex] : null),
    [vocabularies, currentIndex]
  );

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

  const handlePrev = () => {
    if (vocabularies.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? vocabularies.length - 1 : prev - 1));
    setIsFlipped(false); // Reset flip khi chuyển thẻ
  };

  const handleNext = () => {
    if (vocabularies.length === 0) return;
    setCurrentIndex((prev) => (prev === vocabularies.length - 1 ? 0 : prev + 1));
    setIsFlipped(false); // Reset flip khi chuyển thẻ
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleSetDifficulty = (level: Difficulty) => {
    if (!currentVocab) return;
    setDifficulties((prev) => ({
      ...prev,
      [currentVocab.sourceWordId]: level,
    }));
  };

  const getDifficultyTag = (level?: Difficulty) => {
    if (!level) return null;
    if (level === "easy") return <Tag color="green">Dễ</Tag>;
    if (level === "medium") return <Tag color="blue">Trung bình</Tag>;
    return <Tag color="red">Khó</Tag>;
  };

  const parseExample = (exampleStr: string) => {
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
  };

  if (!folderId) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Folder ID không hợp lệ</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Breadcrumb & Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
        <div className="mb-8 bg-[#1e293b] border border-slate-700 rounded-xl px-6 py-4 shadow-sm text-sm font-medium flex items-center flex-wrap gap-2">
          <Link href="/" className="text-blue-600 hover:text-blue-500 transition-colors">
            Trang chủ
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/features/vocabulary" className="text-blue-600 hover:text-blue-500 transition-colors">
            Học từ vựng
          </Link>
          {folderName && (
            <>
              <span className="text-slate-600">/</span>
              <Link href={`/features/vocabulary/${folderId}`} className="text-blue-600 hover:text-blue-500 transition-colors">
                 {folderName}
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300 line-clamp-1">Flashcard</span>
            </>
          )}
        </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-1">
            Chế độ Flashcard - {folderName || "Từ vựng"}
          </h1>
          <p className="text-gray-600">
            {vocabularies.length > 0
              ? `Tổng ${vocabularies.length} từ vựng • Thẻ hiện tại: ${currentIndex + 1}/${vocabularies.length}`
              : "Đang tải danh sách từ vựng..."}
          </p>
        </div>

        <Button
          icon={<RollbackOutlined />}
          onClick={() => router.push(`/features/vocabulary/${folderId}`)}
        >
          Quay lại danh sách
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Spin size="large" />
        </div>
      ) : vocabularies.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Chưa có từ vựng nào trong folder này.</p>
          <Button onClick={() => router.push(`/features/vocabulary/${folderId}`)}>
            Quay lại trang từ vựng
          </Button>
        </div>
      ) : (
        <>
          {/* Flashcard */}
          {currentVocab && (
            <div className="max-w-3xl mx-auto mb-10" style={{ perspective: "1000px" }}>
              <div
                className="relative w-full min-h-[400px]"
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Mặt trước: Chỉ hiển thị từ tiếng Anh */}
                <div
                  className="absolute inset-0 bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 flex flex-col items-center justify-center text-center transition-transform duration-500"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {currentVocab.avatarUrl && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden mb-6">
                      <Image
                        src={currentVocab.avatarUrl}
                        alt={currentVocab.content}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-5xl font-bold text-gray-900">{currentVocab.content}</h2>
                    {currentVocab.audioUrl?.[0]?.url && (
                      <Button
                        type="text"
                        icon={<SoundOutlined />}
                        size="large"
                        onClick={() => playAudio(currentVocab.audioUrl[0].url)}
                        className="text-2xl"
                      />
                    )}
                  </div>
                  <p className="text-xl text-gray-500 mb-6">{currentVocab.pronunciation}</p>
                  <Button
                    type="primary"
                    icon={<SwapOutlined />}
                    size="large"
                    onClick={handleFlip}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Lật thẻ để xem nghĩa
                  </Button>
                </div>

                {/* Mặt sau: Hiển thị đầy đủ thông tin */}
                <div
                  className="absolute inset-0 bg-white rounded-2xl shadow-lg border-2 border-blue-300 p-8 flex flex-col text-center transition-transform duration-500"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)",
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-4xl font-bold text-gray-900">{currentVocab.content}</h2>
                    {currentVocab.audioUrl?.[0]?.url && (
                      <Button
                        type="text"
                        icon={<SoundOutlined />}
                        onClick={() => playAudio(currentVocab.audioUrl[0].url)}
                      />
                    )}
                  </div>

                  <p className="text-lg text-gray-500 mb-3">{currentVocab.pronunciation}</p>

                  <p className="text-3xl text-blue-600 font-semibold mb-4">
                    {currentVocab.translation}
                  </p>

                  {currentVocab.pos && (
                    <Tag color="default" className="mb-4 text-base px-3 py-1">
                      {currentVocab.pos}
                    </Tag>
                  )}

                  {getDifficultyTag(difficulties[currentVocab.sourceWordId]) && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-500 mr-2">Mức độ:</span>
                      {getDifficultyTag(difficulties[currentVocab.sourceWordId])}
                    </div>
                  )}

                  {/* Example */}
                  {currentVocab.example && (() => {
                    const example = parseExample(currentVocab.example);
                    return example ? (
                      <div className="mt-6 p-4 bg-gray-50 rounded-xl w-full text-left">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Ví dụ</p>
                        <div
                          className="text-sm text-gray-800 mb-2"
                          dangerouslySetInnerHTML={{ __html: example.content }}
                        />
                        <div
                          className="text-sm text-gray-600"
                          dangerouslySetInnerHTML={{ __html: example.translation }}
                        />
                      </div>
                    ) : null;
                  })()}

                  {/* Family */}
                  {currentVocab.family && currentVocab.family.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl w-full text-left">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Họ từ:</p>
                      <div className="space-y-1">
                        {currentVocab.family.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-700">
                            <span className="font-semibold">{item.word}</span> ({item.pos}) - {item.meaning}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Synonyms */}
                  {currentVocab.synonyms && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-xl w-full text-left">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Từ đồng nghĩa:</p>
                      <p className="text-sm text-gray-700">{currentVocab.synonyms}</p>
                    </div>
                  )}

                  <Button
                    type="default"
                    icon={<SwapOutlined />}
                    onClick={handleFlip}
                    className="mt-6 self-center"
                  >
                    Lật lại
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="max-w-3xl mx-auto flex flex-col gap-4 items-center">
            <div className="flex items-center justify-between w-full gap-4">
              <Button
                icon={<LeftOutlined />}
                onClick={handlePrev}
                size="large"
                className="flex-1 md:flex-none md:px-8"
              >
                Trước
              </Button>
              <div className="hidden md:block text-gray-500">
                Thẻ {currentIndex + 1}/{vocabularies.length}
              </div>
              <Button
                icon={<RightOutlined />}
                iconPosition="end"
                onClick={handleNext}
                size="large"
                className="flex-1 md:flex-none md:px-8"
              >
                Sau
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => handleSetDifficulty("easy")} className="border-green-500 text-green-600">
                Dễ
              </Button>
              <Button onClick={() => handleSetDifficulty("medium")} className="border-blue-500 text-blue-600">
                Trung bình
              </Button>
              <Button onClick={() => handleSetDifficulty("hard")} className="border-red-500 text-red-600">
                Khó
              </Button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}


