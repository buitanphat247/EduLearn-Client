export default function NotificationsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-[#1e293b] rounded-[32px] p-8 flex flex-col h-full border border-slate-200 dark:border-slate-700 transition-colors duration-300 shadow-sm"
                >
                    <div className="animate-pulse flex flex-col flex-1">
                        {/* Top: Scope Tag */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        </div>

                        {/* Middle: Title & Message */}
                        <div className="min-h-[100px] flex flex-col gap-3">
                            <div className="h-7 w-full bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                            <div className="h-7 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                            <div className="mt-2 space-y-2">
                                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                                <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800 rounded"></div>
                            </div>
                        </div>

                        {/* Bottom: Divider & Footer */}
                        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            </div>
                            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded italic"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
