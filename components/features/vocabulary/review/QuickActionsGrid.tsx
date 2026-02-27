"use client";

import { ReadOutlined, ReloadOutlined, RightOutlined } from "@ant-design/icons";
import Link from "next/link";

const ACTIONS = [
    {
        href: "/vocabulary",
        icon: ReadOutlined,
        title: "Khám phá từ mới",
        subtitle: "Xem danh sách chủ đề",
        color: "blue",
    },
    {
        href: "/vocabulary/review/detail",
        icon: ReloadOutlined,
        title: "Ôn tập flashcard",
        subtitle: "Bắt đầu luyện tập",
        color: "emerald",
    },
] as const;

interface QuickActionsGridProps {
    className?: string;
}

export default function QuickActionsGrid({ className = "" }: QuickActionsGridProps) {
    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
            {ACTIONS.map((action) => {
                const Icon = action.icon;
                const isBlue = action.color === "blue";
                return (
                    <Link key={action.title} href={action.href} className="block group">
                        <div
                            className={`rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 h-full ${isBlue ? "hover:border-blue-200 dark:hover:border-blue-500/30" : "hover:border-emerald-200 dark:hover:border-emerald-500/30"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`p-2.5 rounded-xl ${isBlue ? "bg-blue-50 dark:bg-blue-500/10" : "bg-emerald-50 dark:bg-emerald-500/10"}`}
                                >
                                    <Icon
                                        className={`text-lg ${isBlue ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"}`}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">{action.title}</h3>
                                    <span
                                        className={`inline-flex items-center gap-1 text-xs font-medium group-hover:gap-2 transition-all duration-300 ${isBlue ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"
                                            }`}
                                    >
                                        {action.subtitle} <RightOutlined className="text-[10px]" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
