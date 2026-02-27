"use client";

import { CalendarOutlined, ArrowLeftOutlined, SyncOutlined } from "@ant-design/icons";
import Link from "next/link";

interface ReviewHeaderProps {
    formattedDate: string;
    mounted?: boolean;
    className?: string;
    onRefresh?: () => void;
    loading?: boolean;
}

export default function ReviewHeader({ formattedDate, mounted = true, className = "", onRefresh, loading = false }: ReviewHeaderProps) {
    return (
        <header
            className={`mb-10 transition-all duration-600 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
            style={{ transitionDelay: "100ms" }}
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-3 tracking-tight">
                        Ôn tập & Thống kê
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-16 bg-blue-600 rounded-full" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Theo dõi tiến độ và bắt đầu ôn tập từ vựng
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                    >
                        <SyncOutlined className={`text-sm ${loading ? "animate-spin" : ""}`} />
                        <span>{loading ? "Đang tải..." : "Fast Refresh"}</span>
                    </button>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm">
                        <CalendarOutlined className="text-slate-500 dark:text-slate-400 text-sm" />
                        <span className="text-slate-600 dark:text-slate-300 font-semibold text-sm">{formattedDate}</span>
                    </div>
                    <Link
                        href="/vocabulary"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
                    >
                        <ArrowLeftOutlined className="text-sm" />
                        <span>Quay lại</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}
