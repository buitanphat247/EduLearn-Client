export default function VocabularyQuizSkeleton() {
  return (
    <main className="h-full bg-slate-50 dark:bg-[#0f172a] py-8 text-slate-800 dark:text-slate-200 transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header & Breadcrumb Skeleton */}
        <div className="mb-8">
          {/* Breadcrumb Skeleton */}
          <div className="mb-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl px-6 py-4 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
              <div className="h-4 w-1 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
              <div className="h-4 w-1 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
              <div className="h-4 w-1 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
            </div>
          </div>

          {/* Title & Button Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-9 w-80 md:w-96 bg-slate-200 dark:bg-slate-700/50 rounded-lg animate-pulse" />
              <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
            </div>
            <div className="w-32 h-9 rounded-lg bg-slate-200 dark:bg-slate-700/50 animate-pulse" />
          </div>
        </div>

        {/* Progress Bar Skeleton */}
        <div className="mb-8">
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700/50 rounded-full mb-2 animate-pulse" />
          <div className="flex justify-between text-sm">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
          </div>
        </div>

        {/* Question Card Skeleton */}
        <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 md:p-10">
          {/* Question Title Skeleton */}
          <div className="text-center mb-8">
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700/50 rounded-lg mx-auto mb-6 animate-pulse" />
            
            {/* Word & Audio Icon Skeleton */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-16 w-64 bg-slate-200 dark:bg-slate-700/50 rounded-lg animate-pulse" />
              <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700/50 animate-pulse" />
            </div>

            {/* Pronunciation Skeleton */}
            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700/50 rounded-full mx-auto animate-pulse" />
          </div>

          {/* Answer Options Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 w-full bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-6 flex items-center animate-pulse"
              >
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700/50 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Skeleton */}
        <div className="flex justify-between items-center mt-6">
          <div className="h-12 w-32 bg-slate-200 dark:bg-slate-700/50 rounded-lg animate-pulse" />
          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
          <div className="h-12 w-32 bg-slate-200 dark:bg-slate-700/50 rounded-lg animate-pulse" />
        </div>
      </div>
    </main>
  );
}
