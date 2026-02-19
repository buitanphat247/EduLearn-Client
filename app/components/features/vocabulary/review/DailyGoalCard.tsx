"use client";

import { FireOutlined } from "@ant-design/icons";

interface DailyGoalCardProps {
    dailyGoal: number;
    currentProgress: number;
    goalProgress: number;
    wordsToGoal: number;
    className?: string;
}

export default function DailyGoalCard({
    dailyGoal,
    currentProgress,
    goalProgress,
    wordsToGoal,
    className = "",
}: DailyGoalCardProps) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-6 pl-7 shadow-sm flex-1 ${className}`}
        >
            <div
                className="absolute left-0 top-0 bottom-0 rounded-l-2xl z-10"
                style={{ width: 10, backgroundColor: "#10b981", minWidth: 10 }}
                aria-hidden
            />
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/25 flex items-center justify-center">
                        <FireOutlined className="text-xl text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-0.5">
                            Mục tiêu hôm nay
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Hoàn thành {dailyGoal} từ mỗi ngày để duy trì streak
                        </p>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {currentProgress}
                    </span>
                    <span className="text-lg text-slate-400 dark:text-slate-500 font-semibold">/</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                        {dailyGoal}
                    </span>
                </div>
            </div>

            <div className="relative mb-3">
                <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-700/50 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-700 ease-out"
                        style={{ width: `${goalProgress}%` }}
                    />
                </div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center">
                    {[25, 50, 75].map((milestone) => (
                        <div
                            key={milestone}
                            className="absolute w-0.5 h-3 bg-white/60 dark:bg-slate-500/60 rounded-full"
                            style={{ left: `${milestone}%` }}
                        />
                    ))}
                </div>
            </div>

            <p
                className={`text-sm font-medium ${
                    wordsToGoal > 0
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                }`}
            >
                {wordsToGoal > 0
                    ? `Cố gắng thêm ${wordsToGoal} từ nữa để đạt mục tiêu!`
                    : "🎉 Xuất sắc! Bạn đã hoàn thành mục tiêu hôm nay."}
            </p>
        </div>
    );
}
