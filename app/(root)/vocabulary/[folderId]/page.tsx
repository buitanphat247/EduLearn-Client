"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { App, ConfigProvider, theme } from "antd";
import { SoundOutlined, FileTextOutlined, CheckCircleOutlined, EditOutlined, BookOutlined, BarChartOutlined, CrownOutlined } from "@ant-design/icons";
import { getVocabulariesByFolder, type VocabularyResponse } from "@/lib/api/vocabulary";
import { getSubscriptionStatus } from "@/lib/api/subscription";
import { IoArrowBackOutline } from "react-icons/io5";
import { GoBook } from "react-icons/go";
import VocabularyDetailSkeleton from "@/app/components/features/vocabulary/VocabularyDetailSkeleton";

type Tier = "free" | "pro";

export default function VocabularyDetail() {
  const { message } = App.useApp();
  const router = useRouter();
  const params = useParams();
  const folderId = params?.folderId ? parseInt(params.folderId as string, 10) : null;
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [folderName, setFolderName] = useState("");
  const [isPro, setIsPro] = useState(false);

  const isMountedRef = useRef(true);
  const fetchVocabularies = useCallback(async () => {
    if (!folderId) return;
    if (isMountedRef.current) {
      setLoading(true);
      setVocabularies([]);
      setFolderName("");
    }
    try {
      const data = await getVocabulariesByFolder(folderId);
      if (!isMountedRef.current) return;
      setVocabularies(data);
      if (data.length > 0) setFolderName(data[0].folder.folderName);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      const status = err?.response?.status;
      if (isMountedRef.current && (status === 403 || status === 404)) {
        if (status === 404) {
          message.warning("Không tìm thấy thư mục từ vựng.");
        } else {
          message.warning(err?.response?.data?.message || "Bạn cần gói Pro để truy cập từ vựng.");
        }
        router.replace("/vocabulary");
        return;
      }
      const errorMessage = error instanceof Error ? error.message : "Không thể tải danh sách từ vựng";
      console.error("Error fetching vocabularies:", error);
      if (isMountedRef.current) {
        message.error(errorMessage);
        setVocabularies([]);
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [folderId, message, router]);

  useEffect(() => {
    isMountedRef.current = true;
    if (folderId) fetchVocabularies();
    return () => { isMountedRef.current = false; };
  }, [folderId, fetchVocabularies]);

  useEffect(() => {
    getSubscriptionStatus()
      .then((res) => {
        if (isMountedRef.current) setIsPro(res.isPro);
      })
      .catch(() => {
        if (isMountedRef.current) setIsPro(false);
      });
  }, []);

  const playAudio = (audioUrl: string, id: number) => {
    setPlayingId(id);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      setPlayingId(null);
    };

    audio.onerror = () => {
      setPlayingId(null);
      message.error("Không thể phát audio");
    };

    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
      setPlayingId(null);
      message.error("Trình duyệt chặn phát âm thanh tự động");
    });
  };

  const practiceModes: Array<{
    title: string;
    description: string;
    icon: typeof FileTextOutlined;
    color: string;
    tier: Tier;
    path: string;
  }> = [
    {
      title: "Flashcard",
      description: "Học với thẻ ghi nhớ thông minh",
      icon: FileTextOutlined,
      color: "green",
      tier: "free",
      path: `/vocabulary/flashcard/${folderId}`,
    },
    {
      title: "Kiểm tra",
      description: "Trắc nghiệm & điền từ",
      icon: CheckCircleOutlined,
      color: "blue",
      tier: "free",
      path: `/vocabulary/quiz/${folderId}`,
    },
    {
      title: "Gõ từ",
      description: "Nghe và viết lại từ vựng",
      icon: EditOutlined,
      color: "purple",
      tier: "free",
      path: `/vocabulary/typing/${folderId}`,
    },
    {
      title: "Thống kê",
      description: "Xem tiến độ học tập",
      icon: BarChartOutlined,
      color: "orange",
      tier: "free",
      path: "/vocabulary/review",
    },
  ];

  if (!folderId) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-slate-500">Folder ID không hợp lệ</p>
        </div>
      </main>
    );
  }

  // Render Loading
  if (loading) {
    return <VocabularyDetailSkeleton />;
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm, // Keep dark algorithm for internal Antd if needed, or switch based on context if possible. For now keeping it simple as Antd is mostly used for icons/buttons on dark cards.
        token: {
          colorPrimary: "#3b82f6", // blue-600
          borderRadius: 8,
        },
      }}
    >
      <main className="min-h-screen bg-slate-50 dark:bg-[#0f172a] py-8 eloafont-sans text-slate-800 dark:text-slate-200 transition-colors duration-500">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12">
            <>
              <nav className="mb-8 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl px-6 py-4 shadow-sm text-sm font-medium flex items-center flex-wrap gap-2 transition-colors">
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
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{folderName}</span>
                  </>
                )}
              </nav>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 ">
                <div>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight transition-colors">{folderName || "Từ vựng"}</h1>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-16 bg-blue-600 rounded-full"></div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{vocabularies?.length > 0 ? `${vocabularies.length} từ vựng` : "Đang tải..."}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {vocabularies.length > 0 && (
                    <button
                      onClick={() => router.push(`/vocabulary/flashcard/${folderId}`)}
                      className="group flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <GoBook className="text-xl" />
                      <span>Học ngay</span>
                    </button>
                  )}
                  <button
                    onClick={() => router.push("/vocabulary")}
                    className="group flex items-center gap-2 px-5 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                  >
                    <IoArrowBackOutline className="text-lg transition-transform group-hover:-translate-x-1" />
                    <span className="font-semibold text-sm">Quay lại</span>
                  </button>
                </div>
              </div>
            </>
          </div>

          {/* Practice Modes */}
          {vocabularies.length > 0 && (
            <div className="mb-16">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                <CheckCircleOutlined className="text-blue-500" />
                <span>Chế độ luyện tập</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {practiceModes.map((mode, index) => {
                  const IconComponent = mode.icon;
                  const handleClick = () => {
                    if (mode.tier === "pro" && !isPro) {
                      message.warning("Tính năng này dành cho tài khoản Pro. Vui lòng nâng cấp để sử dụng.");
                      return;
                    }
                    router.push(mode.path);
                  };

                  const colors: Record<string, string> = {
                    green:
                      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40",
                    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 group-hover:bg-blue-500/20 group-hover:border-blue-500/40",
                    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 group-hover:bg-purple-500/20 group-hover:border-purple-500/40",
                    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 group-hover:bg-orange-500/20 group-hover:border-orange-500/40",
                  };

                  const tierBadge =
                    mode.tier === "pro" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/50">
                        <CrownOutlined /> PRO
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                        FREE
                      </span>
                    );

                  return (
                    <div
                      key={index}
                      onClick={handleClick}
                      className="group bg-white dark:bg-[#1e293b] rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors border shrink-0 ${colors[mode.color].split(" group-hover")[0]}`}
                        >
                          <IconComponent className="text-xl" />
                        </div>
                        {tierBadge}
                      </div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1 group-hover:text-blue-600 dark:group-hover:text-white transition-colors">{mode.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{mode.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vocabulary List */}
          {vocabularies.length > 0 ? (
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                <BookOutlined className="text-blue-500" />
                <span>Danh sách từ vựng</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vocabularies.map((vocab) => {
                  const primaryAudio = vocab.audioUrl?.[0]?.url;

                  return (
                    <div
                      key={vocab.sourceWordId}
                      className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-slate-600 transition-all duration-300 group"
                    >
                      {/* Top Section */}
                      <div className="flex items-start gap-4 mb-5">
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3
                              className="text-lg font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                              title={vocab.content}
                            >
                              {vocab.content}
                            </h3>
                            {primaryAudio && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playAudio(primaryAudio, vocab.sourceWordId);
                                }}
                                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 active:scale-90 shadow-sm hover:shadow-md ${playingId === vocab.sourceWordId
                                    ? "bg-blue-600 text-white animate-pulse scale-110"
                                    : "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500"
                                  }`}
                                title="Phát âm"
                              >
                                <SoundOutlined className={`text-base ${playingId === vocab.sourceWordId ? "animate-bounce" : ""}`} />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            {vocab.pos && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wide border border-slate-200 dark:border-slate-700">
                                {vocab.pos}
                              </span>
                            )}
                            <span className="text-sm font-mono text-slate-500">{vocab.pronunciation}</span>
                          </div>

                          <p className="text-blue-600 dark:text-blue-400 font-bold">{vocab.translation}</p>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-[#1e293b] rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-600">
                <BookOutlined className="text-2xl" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có từ vựng nào trong bộ này</p>
            </div>
          )}
        </div>
      </main>
    </ConfigProvider>
  );
}
