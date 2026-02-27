"use client";

import { useMemo, Suspense } from "react";
import FeaturesHeader from "@/components/features/FeaturesHeader";
import VocabularyFeature from "@/components/features/vocabulary/VocabularyFeature";
import { useSubscriptionQuery } from "@/hooks/queries";

export default function VocabularyPage() {
    const { data: subscriptionData, isLoading: subLoading } = useSubscriptionQuery();
    const subscriptionLabel = subLoading ? null : (subscriptionData?.isPro ? "Pro" : "Free");

    const badge = useMemo(() =>
        subscriptionLabel !== null ? (
            <span
                className={
                    subscriptionLabel === "Pro"
                        ? "px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/50"
                        : "px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600"
                }
            >
                {subscriptionLabel}
            </span>
        ) : null
        , [subscriptionLabel]);

    return (
        <main className="h-full bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
            <div className="mx-auto container px-4 py-8">
                <FeaturesHeader
                    title="Học từ vựng"
                    description="Học từ vựng theo chủ đề và chuyên ngành"
                />
                <Suspense fallback={<div className="h-64 flex items-center justify-center">Đang tải dữ liệu...</div>}>
                    <VocabularyFeature />
                </Suspense>
            </div>
        </main>
    );
}
