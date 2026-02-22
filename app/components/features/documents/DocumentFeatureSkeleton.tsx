"use client";

export default function DocumentFeatureSkeleton() {
    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden h-full flex flex-col relative shadow-sm">
                        <div className="p-6 flex-1 animate-pulse">
                            {/* Header Skeleton */}
                            <div className="flex justify-between items-start mb-5">
                                <div className="h-14 w-14 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                            </div>

                            {/* Title Skeleton */}
                            <div className="space-y-3 mb-6">
                                <div className="h-6 w-11/12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                            </div>

                            {/* Info Grid Skeleton */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="h-4 w-20 bg-slate-100 dark:bg-slate-700/50 rounded"></div>
                                <div className="h-4 w-24 bg-slate-100 dark:bg-slate-700/50 rounded justify-self-end"></div>
                            </div>

                            {/* Button Skeleton */}
                            <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl mt-auto"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
