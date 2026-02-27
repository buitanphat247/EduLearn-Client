export default function EventsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="group relative bg-white dark:bg-[#1e293b] rounded-3xl overflow-hidden shadow-sm flex flex-col h-full border border-slate-200 dark:border-slate-700 transition-colors duration-300"
        >
          {/* Side Accent Line */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 dark:bg-slate-700 transition-colors duration-300"></div>

          <div className="p-6 pl-8 flex-1 flex flex-col relative z-10 animate-pulse">
            {/* Header: Status & Icon */}
            <div className="flex justify-between items-start mb-5">
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            </div>

            {/* Title */}
            <div className="mb-4 space-y-2">
              <div className="h-6 w-full bg-slate-200 dark:bg-slate-700 rounded-md"></div>
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            </div>

            {/* Details Grid */}
            <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>

            {/* Action */}
            <div className="mt-auto flex items-center justify-between pt-2">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

