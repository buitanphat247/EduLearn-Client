/**
 * VocabularyFlashcardSkeleton
 * 
 * Loading skeleton cho trang Flashcard.
 * Sử dụng Tailwind classes với dark mode support để đồng bộ với theme.
 */
export default function VocabularyFlashcardSkeleton() {
  return (
    <main className="h-full bg-slate-50 dark:bg-[#0f172a] py-8 text-slate-800 dark:text-slate-200 transition-colors duration-500">
      <div className="container mx-auto px-4">
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
            </div>
          </div>

          {/* Title & Button Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-9 w-80 md:w-96 bg-slate-200 dark:bg-slate-700/50 rounded-lg animate-pulse" />
              <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
            </div>
            <div className="w-40 h-9 rounded-lg bg-slate-200 dark:bg-slate-700/50 animate-pulse" />
          </div>
        </div>

        {/* Flashcard Area Skeleton */}
        <div className="flex flex-col items-center">
          {/* Main Card Skeleton - Front Face */}
          <div className="w-full max-w-3xl mb-10">
            <div className="relative w-full min-h-[450px]">
              <div className="absolute inset-0 bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl shadow-blue-900/5 dark:shadow-black/20 border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center animate-pulse">
                {/* Word & Audio Icon */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-64 bg-slate-200 dark:bg-slate-700/50 rounded-lg" />
                  <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700/50" />
                </div>

                {/* Pronunciation */}
                <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700/50 rounded-full mb-8" />

                {/* Hint Text */}
                <div className="flex items-center gap-2 mt-4">
                  <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700/50 rounded" />
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700/50 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls Skeleton */}
          <div className="w-full max-w-3xl">
            {/* Navigation Buttons Skeleton */}
            <div className="flex justify-around items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 animate-pulse" />
              <div className="w-24 h-8 rounded-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 animate-pulse" />
              <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 animate-pulse" />
            </div>

            {/* Auto-flip Toggle Skeleton */}
            <div className="flex justify-center mb-6">
              <div className="h-10 w-40 rounded-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 animate-pulse" />
            </div>

            {/* Difficulty Rating Skeleton */}
            <div className="flex flex-col items-center gap-3">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
              <div className="flex gap-3">
                <div className="w-20 h-10 rounded-lg bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 animate-pulse" />
                <div className="w-28 h-10 rounded-lg bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 animate-pulse" />
                <div className="w-20 h-10 rounded-lg bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
