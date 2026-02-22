"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import StatsCard, { type StatsCardVariant } from "@/app/components/common/StatsCard";

export interface StatCardItem {
    label: string;
    value: number;
    icon: ReactNode;
    variant: StatsCardVariant;
    path?: string;
}

interface ReviewStatsGridProps {
    statCards: StatCardItem[];
    mounted?: boolean;
    className?: string;
}

export default function ReviewStatsGrid({ statCards, mounted = true, className = "" }: ReviewStatsGridProps) {
    return (
        <section
            className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 transition-all duration-600 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
            style={{ transitionDelay: "300ms" }}
        >
            {statCards.map((card) => {
                const content = (
                    <StatsCard
                        label={card.label}
                        value={card.value}
                        icon={card.icon}
                        variant={card.variant}
                        className={card.path ? "cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50" : ""}
                    />
                );

                if (card.path) {
                    return (
                        <Link key={card.label} href={card.path}>
                            {content}
                        </Link>
                    );
                }

                return <div key={card.label}>{content}</div>;
            })}
        </section>
    );
}
