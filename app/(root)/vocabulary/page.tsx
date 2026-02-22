"use client";

import { useEffect, useState, useRef } from "react";
import FeaturesHeader from "@/app/components/features/FeaturesHeader";
import VocabularyFeature from "@/app/components/features/vocabulary/VocabularyFeature";
import { getSubscriptionStatus } from "@/lib/api/subscription";

export default function VocabularyPage() {
    const [subscriptionLabel, setSubscriptionLabel] = useState<"Free" | "Pro" | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        getSubscriptionStatus()
            .then(({ isPro }) => {
                if (isMountedRef.current) setSubscriptionLabel(isPro ? "Pro" : "Free");
            })
            .catch(() => {
                if (isMountedRef.current) setSubscriptionLabel("Free");
            });
        return () => { isMountedRef.current = false; };
    }, []);

    const badge =
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
        ) : null;

    return (
        <main className="h-full bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
            <div className="mx-auto container px-4 py-8">
                <FeaturesHeader
                    title="Học từ vựng"
                    description="Học từ vựng theo chủ đề và chuyên ngành"
                    badge={badge}
                />
                <VocabularyFeature />
            </div>
        </main>
    );
}
