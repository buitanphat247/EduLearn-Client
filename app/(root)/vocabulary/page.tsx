"use client";

import dynamic from "next/dynamic";
import FeaturesHeader from "@/app/components/features/FeaturesHeader";
import VocabularyFeatureSkeleton from "@/app/components/features/vocabulary/VocabularyFeatureSkeleton";

const VocabularyFeature = dynamic(
    () => import("@/app/components/features/vocabulary/VocabularyFeature"),
    {
        ssr: true,
        loading: () => <VocabularyFeatureSkeleton />
    }
);

export default function VocabularyPage() {
    return (
        <main className="h-full bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
            <div className="mx-auto container px-4 py-8 md:py-12">
                <FeaturesHeader
                    title="Học từ vựng"
                    description="Học từ vựng theo chủ đề và chuyên ngành"
                />
                <VocabularyFeature />
            </div>
        </main>
    );
}
