"use client";

import dynamic from "next/dynamic";
import FeaturesHeader from "@/app/components/features/FeaturesHeader";
import WritingFeatureSkeleton from "@/app/components/features/writing/WritingFeatureSkeleton";

const WritingFeature = dynamic(
    () => import("@/app/components/features/writing/WritingFeature"),
    {
        ssr: true,
        loading: () => <WritingFeatureSkeleton />
    }
);

export default function WritingPage() {
    return (
        <main className="h-full bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
            <div className="mx-auto px-4 py-8">
                <FeaturesHeader
                    title="Luyện viết"
                    description="Luyện viết với AI trợ giúp"
                />
                <WritingFeature />
            </div>
        </main>
    );
}
