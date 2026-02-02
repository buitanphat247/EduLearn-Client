"use client";

import dynamic from "next/dynamic";
import FeaturesHeader from "@/app/components/features/FeaturesHeader";

const ListeningFeature = dynamic(
    () => import("@/app/components/features/listening/ListeningFeature"),
    {
        ssr: true
    }
);

export default function ListeningPage() {
    return (
        <main className="h-full bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
            <div className="mx-auto px-4 py-8 md:py-12">
                <FeaturesHeader
                    title="Luyện nghe"
                    description="Luyện nghe tiếng Anh chuẩn theo cấp độ"
                />
                <ListeningFeature />
            </div>
        </main>
    );
}
