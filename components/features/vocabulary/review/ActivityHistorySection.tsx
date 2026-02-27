"use client";

import { FireOutlined, CalendarOutlined, BookOutlined, ArrowRightOutlined } from "@ant-design/icons";
import Link from "next/link";

export interface ActivityItem {
    date: string;
    count: number;
    level?: number;
}

interface ActivityHistorySectionProps {
    activity: ActivityItem[];
    mounted?: boolean;
    safeNum: (v: unknown) => number;
    className?: string;
}

export default function ActivityHistorySection({
    activity,
    mounted = true,
    safeNum,
    className = "",
}: ActivityHistorySectionProps) {
    return (
        <section
            className={`rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm transition-all duration-600 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
            style={{ transitionDelay: "500ms" }}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10">
                        <FireOutlined className="text-base text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-800 dark:text-white">Lịch sử học tập</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Hoạt động gần đây của bạn</p>
                    </div>
                </div>
            </div>

            {activity && activity.length > 0 ? (
                <div className="space-y-3">
                    {activity.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/30 hover:border-slate-200 dark:hover:border-slate-600/50 transition-colors"
                        >
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
                                <BookOutlined className="text-sm text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                    Đã học {safeNum(item.count)} từ
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">{item.date}</p>
                            </div>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
                                +{safeNum(item.count)}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700/50">
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
                        <CalendarOutlined className="text-3xl text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Chưa có hoạt động nào</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mb-5">
                        Hãy bắt đầu học từ vựng để theo dõi tiến trình của bạn tại đây.
                    </p>
                    <Link
                        href="/vocabulary"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 active:scale-95 transition-all duration-300 shadow-lg shadow-blue-500/20"
                    >
                        Bắt đầu học ngay
                        <ArrowRightOutlined className="text-xs" />
                    </Link>
                </div>
            )}
        </section>
    );
}
