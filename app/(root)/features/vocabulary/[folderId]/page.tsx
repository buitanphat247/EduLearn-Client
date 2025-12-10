"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { App, Spin, Button } from "antd";
import { SoundOutlined, FileTextOutlined, CheckCircleOutlined, EditOutlined, BookOutlined } from "@ant-design/icons";
import { getVocabulariesByFolder, type VocabularyResponse } from "@/lib/api/vocabulary";
import Image from "next/image";

export default function VocabularyDetail() {
  const { message } = App.useApp();
  const params = useParams();
  const folderId = params?.folderId ? parseInt(params.folderId as string, 10) : null;
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [folderName, setFolderName] = useState("");

  useEffect(() => {
    if (folderId) {
      fetchVocabularies();
    }
  }, [folderId]);

  const fetchVocabularies = async () => {
    if (!folderId) return;
    
    const startTime = Date.now();
    setLoading(true);
    try {
      const data = await getVocabulariesByFolder(folderId);
      
      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 250;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
      
      setVocabularies(data);
      if (data.length > 0) {
        setFolderName(data[0].folder.folderName);
      }
    } catch (error: any) {
      // Ensure minimum loading time even on error
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

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
      message.error("Không thể phát audio");
    });
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

  const parseVariations = (variations: string[]) => {
    try {
      if (!variations || variations.length === 0) return [];
      const joined = variations.join("");
      const parsed = JSON.parse(joined);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const practiceModes = [
    {
      title: "Flashcard",
      description: "Luyện tập với thẻ ghi nhớ, lật thẻ để xem nghĩa và ví dụ",
      icon: FileTextOutlined,
      color: "green",
      bgGradient: "from-green-500 to-green-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Kiểm tra",
      description: "Trắc nghiệm và điền từ để kiểm tra kiến thức từ vựng",
      icon: CheckCircleOutlined,
      color: "blue",
      bgGradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Đoán và Gõ Từ",
      description: "Nghe audio, đoán và gõ lại từ vựng chính xác",
      icon: EditOutlined,
      color: "purple",
      bgGradient: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Luyện câu",
      description: "Tạo câu với từ vựng và nhận phản hồi từ AI",
      icon: BookOutlined,
      color: "orange",
      bgGradient: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

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
      <div className="mb-4">
        <div className="mb-5 text-sm text-gray-600">
          <Link href="/" className="hover:text-[#1c91e3] transition-colors">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <Link href="/features/vocabulary" className="hover:text-[#1c91e3] transition-colors">
            Học từ vựng
          </Link>
          {folderName && (
            <>
              <span className="mx-2">/</span>
              <span className="text-gray-800">{folderName}</span>
            </>
          )}
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {folderName || "Từ vựng"}
          </h1>
          <p className="text-gray-600 text-lg">
            {vocabularies.length > 0 ? `${vocabularies.length} từ vựng` : "Đang tải..."}
          </p>
        </div>
      </div>

      {/* Chế độ luyện tập */}
      {!loading && vocabularies.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BookOutlined />
            Chế độ luyện tập
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {practiceModes.map((mode, index) => {
              const IconComponent = mode.icon;
              return (
                <div
                  key={index}
                  onClick={() => message.info("Tính năng này đang được phát triển")}
                  className={`bg-linear-to-br ${mode.bgGradient} rounded-lg p-6 text-white hover:shadow-lg transition-all cursor-pointer`}
                >
                  <div className={`text-black w-12 h-12 ${mode.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                    <IconComponent className={`text-2xl ${mode.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{mode.title}</h3>
                  <p className="text-sm text-white/90">{mode.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Danh sách từ vựng */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : vocabularies.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh sách từ vựng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vocabularies.map((vocab) => {
              const example = parseExample(vocab.example);
              const variations = parseVariations(vocab.variations);
              const primaryAudio = vocab.audioUrl?.[0]?.url;

              return (
                <div
                  key={vocab.sourceWordId}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header with image and audio */}
                  <div className="flex items-start gap-4 mb-4">
                    {vocab.avatarUrl && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={vocab.avatarUrl}
                          alt={vocab.content}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-800">
                          {vocab.content}
                        </h3>
                        {primaryAudio && (
                          <Button
                            type="text"
                            icon={<SoundOutlined />}
                            size="small"
                            onClick={() => playAudio(primaryAudio)}
                            className="shrink-0"
                          />
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mb-1">
                        {vocab.pronunciation}
                      </p>
                      <p className="text-gray-700 font-medium">
                        {vocab.translation}
                      </p>
                      {vocab.pos && (
                        <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {vocab.pos}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Example */}
                  {example && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div
                        className="text-sm text-gray-700 mb-2"
                        dangerouslySetInnerHTML={{ __html: example.content }}
                      />
                      <div
                        className="text-sm text-gray-500"
                        dangerouslySetInnerHTML={{ __html: example.translation }}
                      />
                    </div>
                  )}

                  {/* Variations */}
                  {variations.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Biến thể:</p>
                      <div className="flex flex-wrap gap-2">
                        {variations.slice(0, 5).map((variation: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                          >
                            {variation.variationWordContent || variation}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Family */}
                  {vocab.family && vocab.family.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Họ từ:</p>
                      <div className="space-y-1">
                        {vocab.family.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-600">
                            <span className="font-medium">{item.word}</span> ({item.pos}) - {item.meaning}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Synonyms */}
                  {vocab.synonyms && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Từ đồng nghĩa:</p>
                      <p className="text-sm text-gray-600">{vocab.synonyms}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Chưa có từ vựng nào</p>
        </div>
      )}
    </main>
  );
}

