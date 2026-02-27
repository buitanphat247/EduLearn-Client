export default function NotificationsSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-[#1e293b] rounded-xl p-4 flex items-center gap-4 border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse"
                >
                    {/* Icon Status */}
                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700"></div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                        </div>
                        <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    </div>

                    {/* Meta Info - Desktop */}
                    <div className="hidden sm:flex flex-col items-end gap-1.5 flex-shrink-0 min-w-[100px]">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                        </div>
                        <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
