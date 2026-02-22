"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { BookOutlined, ClockCircleOutlined, RiseOutlined, TrophyOutlined } from "@ant-design/icons";
import {
    ReviewBreadcrumb,
    ReviewHeader,
    ReviewStatsGrid,
    DailyGoalCard,
    QuickActionsGrid,
    type StatCardItem,
} from "@/app/components/features/vocabulary/review";
import { useTheme } from "@/app/context/ThemeContext";
import { App } from "antd";

const ForgettingCurveChart = dynamic(
    () => import("@/app/components/profile/ForgettingCurveChart"),
    { ssr: false, loading: () => <div className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" /> }
);

import ReviewPageSkeleton from "@/app/components/features/vocabulary/review/ReviewPageSkeleton";
import {
    getUserVocabularyStats,
    getUserActivityStats,
    getDueWords,
    getUserVocabularyByUser,
    type UserVocabularyStats,
    type ActivityStat,
    type UserVocabularyResponse,
} from "@/lib/api/vocabulary";
import { getProfile } from "@/lib/api/auth";

const safeNum = (v: unknown): number => (typeof v === "number" && !Number.isNaN(v) ? v : 0);

export default function StatisticsPage() {
    const { message } = App.useApp();
    const { theme } = useTheme();
    const [stats, setStats] = useState<UserVocabularyStats | null>(null);
    const [activity, setActivity] = useState<ActivityStat[]>([]);
    const [dueWords, setDueWords] = useState<UserVocabularyResponse[]>([]);
    const [dueTotal, setDueTotal] = useState(0);
    const [learnedWords, setLearnedWords] = useState<UserVocabularyResponse[]>([]);
    const [learnedTotal, setLearnedTotal] = useState(0);
    const [learnedPage, setLearnedPage] = useState(1);
    const [learnedLoading, setLearnedLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const fetchData = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const [statsData, activityData, dueData] = await Promise.all([
                getUserVocabularyStats(id),
                getUserActivityStats(id),
                getDueWords(id, { limit: 20 }),
            ]);
            if (!isMountedRef.current) return;
            setStats(statsData);
            setActivity(activityData || []);
            setDueWords(dueData?.data || []);
            setDueTotal(dueData?.total || 0);
        } catch (error: unknown) {
            if (isMountedRef.current) message.error("Không thể tải thông tin thống kê");
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    }, [message]);

    useEffect(() => {
        isMountedRef.current = true;
        const init = async () => {
            try {
                const profile = await getProfile();
                if (!isMountedRef.current) return;
                if (profile && profile.user_id) {
                    setUserId(Number(profile.user_id));
                    await fetchData(Number(profile.user_id));
                }
            } catch (error) {
                if (isMountedRef.current) console.error("Error fetching profile", error);
            } finally {
                if (isMountedRef.current) setLoading(false);
            }
        };
        init();
        return () => { isMountedRef.current = false; };
    }, [fetchData]);

    useEffect(() => {
        if (!userId) return;
        const load = async () => {
            setLearnedLoading(true);
            try {
                const res = await getUserVocabularyByUser(userId, { page: learnedPage, limit: 50 });
                if (!isMountedRef.current) return;
                setLearnedWords(Array.isArray(res.data) ? res.data : []);
                setLearnedTotal(res.total ?? 0);
            } catch {
                if (isMountedRef.current) message.error("Không thể tải danh sách từ vựng đã học");
            } finally {
                if (isMountedRef.current) setLearnedLoading(false);
            }
        };
        load();
    }, [userId, learnedPage, message]);

    const handleRefresh = async () => {
        if (!userId) return;
        setLoading(true);
        setLearnedLoading(true);
        try {
            await fetchData(userId);
            const res = await getUserVocabularyByUser(userId, { page: learnedPage, limit: 50 });
            setLearnedWords(Array.isArray(res.data) ? res.data : []);
            setLearnedTotal(res.total ?? 0);
            message.success("Dữ liệu đã được cập nhật");
        } catch (e) {
            message.error("Lỗi khi cập nhật dữ liệu");
        } finally {
            setLoading(false);
            setLearnedLoading(false);
        }
    };

    const total = safeNum(stats?.total);
    const mastered = safeNum(stats?.mastered);
    const dueCount = stats?.dueCount ?? dueTotal;
    const dailyGoal = 20;
    const reviewedToday = safeNum(stats?.reviewedToday);
    const learnedCount = safeNum(stats?.notMastered);
    const goalProgress = Math.min(100, Math.round((reviewedToday / dailyGoal) * 100));
    const wordsToGoal = Math.max(0, dailyGoal - reviewedToday);

    const formattedDate = useMemo(
        () =>
            new Intl.DateTimeFormat("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            }).format(new Date()),
        []
    );

    const statCards: StatCardItem[] = [
        { label: "Tổng từ vựng", value: total, icon: <BookOutlined className="text-2xl" />, variant: "blue" },
        { label: "Đang học", value: learnedCount, icon: <RiseOutlined className="text-2xl" />, variant: "cyan" },
        { label: "Đã thành thạo", value: mastered, icon: <TrophyOutlined className="text-2xl" />, variant: "emerald" },
        { label: "Cần ôn tập", value: dueCount, icon: <ClockCircleOutlined className="text-2xl" />, variant: "indigo", path: "/vocabulary/review/detail" },
    ];

    if (loading) {
        return <ReviewPageSkeleton />;
    }

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
            <div className="container mx-auto px-4 py-8 flex flex-col space-y-8">
                <ReviewBreadcrumb mounted={mounted} />

                <ReviewHeader formattedDate={formattedDate} mounted={mounted} onRefresh={handleRefresh} loading={loading || learnedLoading} />

                <ReviewStatsGrid statCards={statCards} mounted={mounted} />

                <section
                    className={`grid gap-4 transition-all duration-600 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{ transitionDelay: "400ms" }}
                >
                    <div>
                        <ForgettingCurveChart theme={theme} />
                    </div>
                    <div>
                        <DailyGoalCard
                            dailyGoal={dailyGoal}
                            currentProgress={Math.min(reviewedToday, dailyGoal)}
                            goalProgress={goalProgress}
                            wordsToGoal={wordsToGoal}
                        />
                    </div>
                    <div>
                        <QuickActionsGrid />
                    </div>

                    {/* Bảng từ vựng đã học */}
                    <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            Từ vựng đã học
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-left">
                                        <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">#</th>
                                        <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Từ vựng</th>
                                        <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Nghĩa</th>
                                        <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-400 w-20">Gói</th>
                                        <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Thời gian review lại</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {learnedLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                                Đang tải...
                                            </td>
                                        </tr>
                                    ) : learnedWords.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                                Chưa có từ vựng nào
                                            </td>
                                        </tr>
                                    ) : (
                                        learnedWords.map((item, idx) => (
                                            <tr
                                                key={`${item.user_id}-${item.sourceWordId}`}
                                                className="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                            >
                                                <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                                                    {(learnedPage - 1) * 50 + idx + 1}
                                                </td>
                                                <td className="px-6 py-3 font-medium text-slate-800 dark:text-white">
                                                    {item.vocabulary?.content ?? "-"}
                                                </td>
                                                <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                                                    {item.vocabulary?.translation ?? "-"}
                                                </td>
                                                <td className="px-6 py-3">
                                                    {(item as { folder_pro?: boolean }).folder_pro ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/50">
                                                            PRO
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400">
                                                            FREE
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                                                    {item.next_review_at
                                                        ? new Date(item.next_review_at).toLocaleString("vi-VN", {
                                                            dateStyle: "short",
                                                            timeStyle: "short",
                                                        })
                                                        : "-"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {learnedTotal > 50 && (
                            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-700">
                                <span className="text-slate-500 dark:text-slate-400 text-sm">
                                    {(learnedPage - 1) * 50 + 1}-{Math.min(learnedPage * 50, learnedTotal)} / {learnedTotal}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setLearnedPage((p) => Math.max(1, p - 1))}
                                        disabled={learnedPage <= 1}
                                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Trước
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLearnedPage((p) => p + 1)}
                                        disabled={learnedPage * 50 >= learnedTotal}
                                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </main>
    );
}
