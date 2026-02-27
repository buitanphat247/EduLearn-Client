"use client";

import Link from "next/link";

interface ReviewBreadcrumbProps {
    className?: string;
    mounted?: boolean;
}

export default function ReviewBreadcrumb({ className = "", mounted = true }: ReviewBreadcrumbProps) {
    return (
        <nav
            className={`mb-8 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl px-6 py-4 shadow-sm text-sm font-medium flex items-center flex-wrap gap-2 transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"} ${className}`}
        >
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                Trang chủ
            </Link>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <Link href="/vocabulary" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                Học từ vựng
            </Link>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">Ôn tập & Thống kê</span>
        </nav>
    );
}
