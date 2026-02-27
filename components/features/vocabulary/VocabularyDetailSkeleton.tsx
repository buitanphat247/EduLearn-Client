
export default function VocabularyDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] py-8 md:py-12 font-sans transition-colors duration-500">
      <div className="container mx-auto px-4">
        {/* Header Skeleton */}
        <div className="mb-12 animate-pulse">
          {/* Breadcrumb Skeleton */}
          <div className="mb-8 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl px-6 py-4 w-full flex items-center gap-3">
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700/50 rounded-md" />
            <div className="h-3 w-3 bg-slate-200 dark:bg-slate-700/50 rounded-full" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700/50 rounded-md" />
            <div className="h-3 w-3 bg-slate-200 dark:bg-slate-700/50 rounded-full" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700/50 rounded-md" />
          </div>

          {/* Title Section Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="h-10 md:h-12 w-3/4 md:w-96 bg-slate-200 dark:bg-slate-700/50 rounded-lg mb-4" />
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-700/50 rounded-full" />
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700/50 rounded-md" />
              </div>
            </div>
            <div className="h-11 w-36 bg-slate-200 dark:bg-slate-700/50 rounded-full shadow-lg" />
          </div>
        </div>

        {/* Practice Modes Skeleton */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6 animate-pulse">
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700/50" />
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700/50 rounded-md" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 shadow-sm animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700/50 mb-4" />
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700/50 rounded-md mb-2" />
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-700/50 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Vocabulary List Skeleton */}
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700/50" />
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700/50 rounded-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm animate-pulse">
                {/* Top Section */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700/50 shrink-0" />
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700/50 rounded-md" />
                      <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700/50" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-700/50" />
                      <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700/50" />
                    </div>
                    <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-700/50 rounded-md" />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-200 dark:bg-slate-700/50 mb-4" />

                {/* Example Section */}
                <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700/50">
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-700/50 rounded mb-2" />
                  <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700/50 rounded" />
                </div>

                {/* Details */}
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-5 w-16 bg-slate-200 dark:bg-slate-700/50 rounded-md" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
