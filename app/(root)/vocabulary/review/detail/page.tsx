"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { App, Button, ConfigProvider, theme, Empty, Pagination } from "antd";
import {
    SoundOutlined,
    CheckCircleOutlined,
    EditOutlined,
    BookOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    HistoryOutlined,
    RightOutlined,
    LockOutlined,
    CrownOutlined
} from "@ant-design/icons";
import { getDueWords, type UserVocabularyResponse } from "@/lib/api/vocabulary";
import { getSubscriptionStatus } from "@/lib/api/subscription";
import { getProfile } from "@/lib/api/auth";
import Image from "next/image";
import { IoArrowBackOutline } from "react-icons/io5";
import { GoBook } from "react-icons/go";
import VocabularyDetailSkeleton from "@/app/components/features/vocabulary/VocabularyDetailSkeleton";
import { useTheme } from "@/app/context/ThemeContext";

export default function ReviewDetailPage() {
    const { message } = App.useApp();
    const router = useRouter();
    const { theme: themeName } = useTheme();
    const [vocabularies, setVocabularies] = useState<UserVocabularyResponse[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);
    const [isPro, setIsPro] = useState(false);

    const isMountedRef = useRef(true);
    useEffect(() => {
        isMountedRef.current = true;
        const init = async () => {
            try {
                const [profile, sub] = await Promise.all([
                    getProfile(),
                    getSubscriptionStatus().catch(() => ({ isPro: false })),
                ]);
                if (!isMountedRef.current) return;
                if (profile && profile.user_id) {
                    setUserId(Number(profile.user_id));
                    await fetchDueWords(Number(profile.user_id), 1);
                }
                if (isMountedRef.current) setIsPro(sub?.isPro ?? false);
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                if (isMountedRef.current) setLoading(false);
            }
        };
        init();
        return () => { isMountedRef.current = false; };
    }, []);

    const fetchDueWords = async (id: number, p: number) => {
        if (isMountedRef.current) setLoading(true);
        try {
            const res = await getDueWords(id, { page: p, limit: 50 });
            if (!isMountedRef.current) return;
            setVocabularies(res.data);
            setTotal(res.total);
        } catch (error: any) {
            if (isMountedRef.current) message.error("Không thể tải danh sách tài liệu cần ôn tập");
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    };

    const handlePageChange = (p: number) => {
        setPage(p);
        if (userId) fetchDueWords(userId, p);
    };

    const playAudio = (audioUrl: string) => {
        const audio = new Audio(audioUrl);
        audio.play().catch((error) => {
            console.error("Error playing audio:", error);
            message.error("Không thể phát audio");
        });
    };

    const practiceModes = [
        {
            title: "Flashcard",
            description: "Ôn tập với thẻ ghi nhớ",
            icon: BookOutlined,
            color: "green",
            path: "/vocabulary/flashcard/review",
        },
        {
            title: "Kiểm tra",
            description: "Làm bài trắc nghiệm",
            icon: CheckCircleOutlined,
            color: "blue",
            path: "/vocabulary/quiz/review",
        },
        {
            title: "Gõ từ",
            description: "Luyện gõ từ vựng",
            icon: EditOutlined,
            color: "purple",
            path: "/vocabulary/typing/review",
        },
    ];

    if (loading && vocabularies.length === 0) {
        return <VocabularyDetailSkeleton />;
    }

    return (
        <ConfigProvider
            theme={{
                algorithm: themeName === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: "#3b82f6",
                    borderRadius: 12,
                },
            }}
        >
            <main className="min-h-screen bg-slate-50 dark:bg-[#0f172a] py-8 text-slate-800 dark:text-slate-200 transition-colors duration-500">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="mb-12">
                        <nav className="mb-8 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl px-6 py-4 shadow-sm text-sm font-medium flex items-center flex-wrap gap-2 transition-colors">
                            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                                Trang chủ
                            </Link>
                            <span className="text-slate-400 dark:text-slate-600">/</span>
                            <Link href="/vocabulary" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                                Học từ vựng
                            </Link>
                            <span className="text-slate-400 dark:text-slate-600">/</span>
                            <Link href="/vocabulary/review" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                                Thống kê
                            </Link>
                            <span className="text-slate-400 dark:text-slate-600">/</span>
                            <span className="text-slate-600 dark:text-slate-300 font-medium">Danh sách ôn tập</span>
                        </nav>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight">
                                    Danh sách cần ôn tập
                                </h1>
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-16 bg-blue-600 rounded-full"></div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        {total > 0 ? `${total} từ vựng đã đến hạn` : "Tuyệt vời! Bạn không còn từ nào cần ôn tập."}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => router.push("/vocabulary/review")}
                                    className="group flex items-center gap-2 px-5 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                                >
                                    <IoArrowBackOutline className="text-lg transition-transform group-hover:-translate-x-1" />
                                    <span className="font-semibold text-sm">Quay lại</span>
                                </button>
                            </div>
                        </div>


                    </div>

                    {/* Practice Modes */}
                    {vocabularies.length > 0 && (
                        <div className="mb-16">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <HistoryOutlined className="text-blue-500" />
                                <span>Bắt đầu ôn tập ngay</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {practiceModes.map((mode, index) => {
                                    const IconComponent = mode.icon;
                                    const colors: Record<string, string> = {
                                        green: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                                        blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                                        purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
                                    };
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => router.push(mode.path)}
                                            className="group relative overflow-hidden bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                                        >
                                            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${mode.color === 'green' ? 'bg-emerald-500' : mode.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm border ${colors[mode.color]}`}>
                                                <IconComponent className="text-2xl" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 group-hover:text-blue-600 transition-colors">
                                                {mode.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{mode.description}</p>
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                                <span>Bắt đầu</span>
                                                <RightOutlined className="text-[10px]" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Due Words List */}
                    {vocabularies.length > 0 ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                    <ClockCircleOutlined />
                                </div>
                                <span>Chi tiết các từ đến hạn</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                {vocabularies.map((vocab, idx) => (
                                    <div
                                        key={vocab.sourceWordId}
                                        className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col">
                                                <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {vocab.vocabulary?.content}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <SoundOutlined
                                                        className="text-slate-400 hover:text-blue-500 cursor-pointer transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (vocab.vocabulary?.audioUrl?.[0]?.url) {
                                                                playAudio(vocab.vocabulary.audioUrl[0].url);
                                                            } else {
                                                                message.warning("Không có audio cho từ này");
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-xs text-slate-400 font-medium italic">/{vocab.vocabulary?.pronunciation}/</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {vocab.folder_pro && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/50 uppercase tracking-wider">
                                                        <CrownOutlined className="text-xs" /> PRO
                                                    </span>
                                                )}
                                                {vocab.folder_pro && !isPro && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-600/50 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-500/50" title="Cần gói Pro để ôn từ này">
                                                        <LockOutlined className="text-xs" />
                                                    </span>
                                                )}
                                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/50 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-600/50">
                                                    {vocab.vocabulary?.pos}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-4 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-lg inline-block">
                                            {vocab.vocabulary?.translation}
                                        </p>

                                        <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/30">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tight">
                                                    <CalendarOutlined className="text-orange-500" />
                                                    <span>Đến hạn: {vocab.next_review_at ? new Date(vocab.next_review_at).toLocaleString("vi-VN") : "Ngay bây giờ"}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                                    <HistoryOutlined className="text-blue-500" />
                                                    <span>Lần học: <span className="font-bold text-slate-700 dark:text-slate-200">{vocab.repetition}</span></span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                                    <CheckCircleOutlined className="text-emerald-500" />
                                                    <span>Đúng: <span className="font-bold text-slate-700 dark:text-slate-200">{vocab.practice_count}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center pb-12 mt-8">
                                <Pagination
                                    current={page}
                                    total={total}
                                    pageSize={50}
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                    className="dark:text-slate-200 custom-pagination"
                                />
                            </div>
                        </div>
                    ) : !loading && (
                        <div className="text-center py-24 bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in zoom-in duration-700">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                                <CheckCircleOutlined className="text-4xl" />
                            </div>
                            <h3 className="text-2xl font-bold dark:text-white mb-3 tracking-tight">Tuyệt vời! Bạn đã hoàn thành!</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-lg">
                                Hiện tại không còn từ vựng nào đến hạn ôn tập. Hãy dành thời gian khám phá thêm các bộ từ mới.
                            </p>
                            <button
                                onClick={() => router.push("/vocabulary")}
                                className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                Khám phá kho từ vựng
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </ConfigProvider>
    );
}
