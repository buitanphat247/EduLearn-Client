export default function VocabularyFeatureSkeleton() {
    return (
        <div className="w-full flex flex-col items-center">

            <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div key={index} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden h-full flex flex-col relative transition-colors duration-300 shadow-sm">
                            <div className="flex-1 p-6 animate-pulse">
                                <div className="flex justify-between items-start mb-5">
                                    <div className="h-14 w-14 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                                    <div className="h-6 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                                </div>

                                <div className="space-y-3">
                                    <div className="h-5 w-4/5 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-700/50 rounded"></div>
                                    <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-700/50 rounded"></div>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30 p-4 px-6">
                                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                                <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
