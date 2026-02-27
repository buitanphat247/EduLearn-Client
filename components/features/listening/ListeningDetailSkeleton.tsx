/**
 * Skeleton loading cho trang /listening/[id]
 * Layout khớp 1:1 với ListeningPage thật:
 * - Breadcrumb → Title + subtitle → Back button
 * - Shortcuts bar
 * - Progress badge
 * - Audio player card
 * - Input area (textarea + buttons)
 */
export default function ListeningDetailSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 md:p-8 font-sans transition-colors duration-500">
            <div className="container mx-auto">
                {/* Header */}
                <div className="mb-8">
                    {/* Breadcrumb: Trang chủ / Học nghe / [lesson name] */}
                    <div className="mb-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl px-6 py-4 shadow-sm flex items-center gap-2 animate-pulse">
                        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-2 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-2 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>

                    {/* Title row: Title + subtitle left, Back button right */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
                        <div className="space-y-3">
                            <div className="h-9 w-64 md:w-80 bg-slate-200 dark:bg-slate-700/50 rounded-lg" />
                            <div className="h-5 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
                        </div>
                        {/* Back Button */}
                        <div className="w-44 h-10 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700" />
                    </div>
                </div>

                {/* Content — single column stack (matches real page space-y-6) */}
                <div className="space-y-6">
                    {/* Shortcuts Bar */}
                    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex items-center gap-4 animate-pulse">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-blue-200 dark:bg-blue-600/30 rounded" />
                            <div className="h-4 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-12 bg-slate-100 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600" />
                            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-8 bg-slate-100 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600" />
                            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                    </div>

                    {/* Progress Badge */}
                    <div className="flex items-center gap-3 animate-pulse">
                        <div className="h-6 w-24 bg-blue-500/20 dark:bg-blue-600/30 rounded-full" />
                    </div>

                    {/* Audio Player Card */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm animate-pulse">
                        <div className="flex items-center gap-5">
                            {/* Play button */}
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0" />

                            {/* Progress bar + time */}
                            <div className="flex-1 space-y-3">
                                <div className="flex justify-between">
                                    <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
                                    <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full" />
                            </div>

                            {/* Speed + controls */}
                            <div className="flex gap-3 shrink-0">
                                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
                                <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="space-y-4 animate-pulse">
                        {/* Section label */}
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-blue-500 rounded-full" />
                            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>

                        {/* Textarea */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700/50 w-full p-5 shadow-inner">
                            <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded mb-3" />
                            <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded mb-3" />
                            <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded" />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <div className="h-11 w-32 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-500/20 rounded-xl" />
                            <div className="h-11 w-32 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
