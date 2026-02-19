"use client";

import { ReactNode } from "react";

export type StatsCardVariant = "blue" | "cyan" | "teal" | "emerald" | "indigo";

const variantStyles: Record<
    StatsCardVariant,
    { iconBg: string; accent: string; barColor: string; barColorHex: string }
> = {
    blue: {
        iconBg: "bg-blue-100 dark:bg-blue-500/25",
        accent: "text-blue-600 dark:text-blue-400",
        barColor: "bg-blue-500 dark:bg-blue-400",
        barColorHex: "#3b82f6",
    },
    cyan: {
        iconBg: "bg-cyan-100 dark:bg-cyan-500/25",
        accent: "text-cyan-600 dark:text-cyan-400",
        barColor: "bg-cyan-500 dark:bg-cyan-400",
        barColorHex: "#06b6d4",
    },
    teal: {
        iconBg: "bg-teal-100 dark:bg-teal-500/25",
        accent: "text-teal-600 dark:text-teal-400",
        barColor: "bg-teal-500 dark:bg-teal-400",
        barColorHex: "#14b8a6",
    },
    emerald: {
        iconBg: "bg-emerald-100 dark:bg-emerald-500/25",
        accent: "text-emerald-600 dark:text-emerald-400",
        barColor: "bg-emerald-500 dark:bg-emerald-400",
        barColorHex: "#10b981",
    },
    indigo: {
        iconBg: "bg-indigo-100 dark:bg-indigo-500/25",
        accent: "text-indigo-600 dark:text-indigo-400",
        barColor: "bg-indigo-500 dark:bg-indigo-400",
        barColorHex: "#6366f1",
    },
};

export interface StatsCardProps {
    label: string;
    value: number | string;
    icon: ReactNode;
    variant?: StatsCardVariant;
    className?: string;
}

export default function StatsCard({ label, value, icon, variant = "blue", className = "" }: StatsCardProps) {
    const styles = variantStyles[variant];

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-5 pl-7 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between gap-4 ${className}`}
        >
            <div
                className="absolute left-0 top-0 bottom-0 rounded-l-2xl z-10"
                style={{ width: 10, backgroundColor: styles.barColorHex, minWidth: 10 }}
                aria-hidden
            />
            <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</p>
                <div className={`text-3xl font-extrabold tabular-nums ${styles.accent}`}>{value}</div>
            </div>
            <div
                className={`shrink-0 w-14 h-14 rounded-2xl ${styles.iconBg} flex items-center justify-center ${styles.accent}`}
            >
                {icon}
            </div>
        </div>
    );
}
