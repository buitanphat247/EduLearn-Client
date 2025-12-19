"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { App, Spin, Button, ConfigProvider, theme } from "antd";
import { SoundOutlined, FileTextOutlined, CheckCircleOutlined, EditOutlined, BookOutlined } from "@ant-design/icons";
import { getVocabulariesByFolder, type VocabularyResponse } from "@/lib/api/vocabulary";
import Image from "next/image";

export default function VocabularyDetail() {
  const { message } = App.useApp();
  const router = useRouter();
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
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        components: {
          Button: {
            colorPrimary: '#3b82f6',
            algorithm: true,
          }
        }
      }}
    >
      <main className="min-h-screen bg-[#0f172a] py-12">
        <div className="container mx-auto px-4">
          <div className="mb-10">
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
                  <span className="text-slate-300 line-clamp-1">{folderName}</span>
                </>
              )}
            </div>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                {folderName || "Từ vựng"}
              </h1>
              <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mb-6"></div>
              <p className="text-slate-400 text-lg">
                {vocabularies.length > 0 ? `${vocabularies.length} từ vựng trong bộ này` : "Đang tải dữ liệu..."}
              </p>
            </div>
          </div>

          {/* Chế độ luyện tập */}
          {!loading && vocabularies.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Chế độ luyện tập
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {practiceModes.map((mode, index) => {
                  const IconComponent = mode.icon;
                  const handleClick = () => {
                    if (mode.title === "Flashcard") {
                      router.push(`/features/vocabulary/flashcard/${folderId}`);
                    } else {
                      message.info("Tính năng này đang được phát triển");
                    }
                  };

                  // Map customized styles based on color prop
                  const colorStyles: Record<string, string> = {
                     green: "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20",
                     blue: "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20",
                     purple: "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20",
                     orange: "bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20",
                  };
                  
                  return (
                    <div
                      key={index}
                      onClick={handleClick}
                      className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer group relative overflow-hidden"
                    >

                      
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors ${colorStyles[mode.color]}`}>
                        <IconComponent className="text-2xl" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{mode.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{mode.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Danh sách từ vựng */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : vocabularies.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                 <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                 Danh sách từ vựng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vocabularies.map((vocab) => {
                  const example = parseExample(vocab.example);
                  const variations = parseVariations(vocab.variations);
                  const primaryAudio = vocab.audioUrl?.[0]?.url;

                  return (
                    <div
                      key={vocab.sourceWordId}
                      className="bg-[#1e293b] rounded-2xl border border-slate-700 p-6 hover:border-slate-600 transition-all hover:shadow-xl"
                    >
                      {/* Header with image and audio */}
                      <div className="flex items-start gap-4 mb-5">
                        {vocab.avatarUrl ? (
                          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-700/50">
                            <Image
                              src={vocab.avatarUrl}
                              alt={vocab.content}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                           <div className="w-20 h-20 rounded-xl bg-slate-800 flex items-center justify-center text-slate-600 border border-slate-700/50">
                              <span className="text-2xl font-bold">{vocab.content.charAt(0)}</span>
                           </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-white truncate">
                              {vocab.content}
                            </h3>
                            {primaryAudio && (
                              <Button
                                type="text"
                                icon={<SoundOutlined />}
                                size="small"
                                onClick={() => playAudio(primaryAudio)}
                                className="shrink-0 text-slate-400 hover:text-blue-400"
                              />
                            )}
                          </div>
                          <p className="text-slate-500 text-sm mb-2 font-mono">
                            {vocab.pronunciation}
                          </p>
                          <p className="text-blue-400 font-semibold text-lg mb-2">
                            {vocab.translation}
                          </p>
                          {vocab.pos && (
                            <span className="inline-block px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg border border-slate-700">
                              {vocab.pos}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Example */}
                      {example && (
                        <div className="mb-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                          <div
                            className="text-sm text-slate-300 mb-2 italic"
                            dangerouslySetInnerHTML={{ __html: example.content }}
                          />
                          <div
                            className="text-sm text-slate-500"
                            dangerouslySetInnerHTML={{ __html: example.translation }}
                          />
                        </div>
                      )}

                      {/* Variations */}
                      {variations.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Biến thể</p>
                          <div className="flex flex-wrap gap-2">
                            {variations.slice(0, 5).map((variation: any, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs rounded-lg"
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
                          <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Họ từ</p>
                          <div className="space-y-2">
                            {vocab.family.map((item, idx) => (
                              <div key={idx} className="text-sm text-slate-400 flex items-baseline gap-2">
                                <span className="font-semibold text-slate-300">{item.word}</span>
                                <span className="text-xs opacity-75">({item.pos})</span>
                                <span className="text-slate-500">- {item.meaning}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Synonyms */}
                      {vocab.synonyms && (
                        <div className="pt-4 border-t border-slate-700/50 mt-4">
                          <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Đồng nghĩa</p>
                          <p className="text-sm text-slate-400">{vocab.synonyms}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-[#1e293b] rounded-3xl border border-slate-700">
              <p className="text-slate-400 text-lg">Chưa có từ vựng nào trong bộ này</p>
            </div>
          )}
        </div>
      </main>
    </ConfigProvider>
  );
}

