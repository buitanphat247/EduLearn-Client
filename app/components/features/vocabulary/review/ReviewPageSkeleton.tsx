"use client";

export default function ReviewPageSkeleton() {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
            <div className="container mx-auto px-4 py-8 flex flex-col space-y-8">
                {/* Breadcrumb skeleton */}
                <div className="rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 px-6 py-4 animate-pulse">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-3 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-3 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-32 bg-slate-300 dark:bg-slate-600 rounded" />
                    </div>
                </div>

                {/* Header skeleton */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-pulse">
                    <div>
                        <div className="h-10 md:h-14 w-64 md:w-80 bg-slate-200 dark:bg-slate-700 rounded-xl mb-3" />
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-16 bg-blue-500/30 rounded-full" />
                            <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <div className="h-10 w-48 rounded-full bg-slate-200 dark:bg-slate-700" />
                    </div>
                </div>

                {/* Stats grid skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-5 pl-7 animate-pulse"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                                    <div className="h-9 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
                                </div>
                                <div className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main content grid skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {/* ForgettingCurveChart skeleton */}
                    <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 p-6 animate-pulse overflow-hidden">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
                            <div>
                                <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                                <div className="h-4 w-56 bg-slate-100 dark:bg-slate-700/50 rounded" />
                            </div>
                        </div>
                        <div className="h-[300px] w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-5" />
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800/50" />
                            ))}
                        </div>
                    </div>

                    {/* DailyGoal + QuickActions skeleton */}
                    <div className="lg:col-span-3 flex flex-col space-y-4">
                        {/* Daily goal skeleton */}
                        <div className="rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 p-6 animate-pulse flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-500/20" />
                                    <div>
                                        <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                                        <div className="h-4 w-64 bg-slate-100 dark:bg-slate-700/50 rounded" />
                                    </div>
                                </div>
                                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full mb-3" />
                            <div className="h-4 w-48 bg-slate-100 dark:bg-slate-700/50 rounded" />
                        </div>

                        {/* Quick actions skeleton */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 p-5 animate-pulse"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                                        <div className="flex-1">
                                            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                                            <div className="h-3 w-36 bg-slate-100 dark:bg-slate-700/50 rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
