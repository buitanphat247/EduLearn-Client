/**
 * WritingPracticeSkeleton
 * 
 * Loading skeleton cho trang Writing Practice.
 * Sử dụng Tailwind classes với dark mode support để đồng bộ với theme.
 */
export default function WritingPracticeSkeleton() {
  return (
    <main className="h-full bg-slate-50 dark:bg-[#0f172a] py-8 text-slate-800 dark:text-slate-200 transition-colors duration-500">
      <div className="container mx-auto px-4">
        {/* Header Skeleton */}
        <div className="mb-8">
          {/* Breadcrumbs */}
          <div className="mb-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl px-6 py-4 h-14 w-full animate-pulse" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              {/* Title */}
              <div className="w-64 h-10 rounded-lg mb-3 animate-pulse bg-slate-200 dark:bg-slate-700/50" />
              {/* Stats */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-6 rounded animate-pulse bg-slate-200 dark:bg-slate-700/50" />
                <div className="w-24 h-6 rounded animate-pulse bg-slate-200 dark:bg-slate-700/50" />
              </div>
            </div>
            {/* Back Button */}
            <div className="w-32 h-10 rounded-lg animate-pulse bg-slate-200 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Dialogue Skeleton */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-xl overflow-hidden h-[500px] p-4">
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-full h-24 rounded-xl animate-pulse p-3 space-y-2 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50"
                  >
                    <div className="w-16 h-3 rounded animate-pulse bg-slate-200 dark:bg-slate-700/50" />
                    <div className="w-full h-4 rounded animate-pulse bg-slate-200 dark:bg-slate-700/50" />
                    <div className="w-3/4 h-4 rounded animate-pulse bg-slate-200 dark:bg-slate-700/50" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Transcript Skeleton */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-hidden h-[500px] flex flex-col">
              {/* Header */}
              <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50">
                <div className="w-24 h-5 rounded animate-pulse bg-slate-200 dark:bg-slate-700/50" />
                <div className="flex gap-2">
                  <div className="w-24 h-8 rounded-full animate-pulse bg-slate-200 dark:bg-slate-700/50" />
                  <div className="w-20 h-8 rounded-full animate-pulse bg-slate-200 dark:bg-slate-700/50" />
                </div>
              </div>
              {/* List */}
              <div className="p-4 space-y-3 flex-1 overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-full h-24 rounded-xl animate-pulse p-3 space-y-2 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50"
                  >
                    <div className="w-16 h-3 rounded animate-pulse bg-slate-200 dark:bg-slate-700/50" />
                    <div className="w-full h-4 rounded animate-pulse bg-slate-200 dark:bg-slate-700/50" />
                    <div className="w-3/4 h-4 rounded animate-pulse bg-slate-200 dark:bg-slate-700/50" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Input Area Skeleton - Full Width */}
        <div className="mt-6 flex items-end gap-3">
          {/* Left Button Skeleton */}
          <div className="pb-1">
            <div className="w-12 h-12 rounded-full animate-pulse shadow-lg bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50" />
          </div>

          {/* Center Input Skeleton */}
          <div className="flex-1 h-14 rounded-3xl animate-pulse shadow-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/50" />

          {/* Right Button Skeleton */}
          <div className="pb-1">
            <div className="w-12 h-12 rounded-full animate-pulse shadow-lg bg-slate-200 dark:bg-slate-700/50" />
          </div>
        </div>
      </div>
    </main>
  );
}
