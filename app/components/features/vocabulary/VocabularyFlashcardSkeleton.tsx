/**
 * VocabularyFlashcardSkeleton
 * 
 * Loading skeleton cho trang Flashcard.
 * Sử dụng Tailwind classes với dark mode support để đồng bộ với theme.
 */
export default function VocabularyFlashcardSkeleton() {
  return (
    <main className="h-full bg-slate-50 dark:bg-[#0f172a] py-8 md:py-12 text-slate-800 dark:text-slate-200 transition-colors duration-500">
      <div className="container mx-auto px-4">
        {/* Header & Breadcrumb Skeleton */}
        <div className="mb-8">
          <div className="mb-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl px-6 py-4 h-14 w-full animate-pulse" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="h-10 w-80 md:w-96 rounded-lg animate-pulse bg-slate-200 dark:bg-slate-700/50" />
              <div className="h-5 w-48 rounded animate-pulse bg-slate-200 dark:bg-slate-700/50" />
            </div>

            <div className="w-40 h-9 rounded-lg animate-pulse bg-slate-200 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700" />
          </div>
        </div>

        {/* Flashcard Area Skeleton */}
        <div className="flex flex-col items-center">
          {/* Main Card Skeleton */}
          <div className="w-full max-w-3xl mb-10 h-[450px] relative">
            <div className="absolute inset-0 bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl shadow-blue-900/5 dark:shadow-black/20 border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center animate-pulse">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-14 w-48 rounded-lg bg-slate-200 dark:bg-slate-700/50" />
                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700/50" />
              </div>

              <div className="h-6 w-32 rounded-full bg-slate-200 dark:bg-slate-700/50 mb-8" />

              <div className="h-12 w-48 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20" />
            </div>
          </div>

          {/* Controls Skeleton */}
          <div className="w-full max-w-3xl">
            {/* Navigation Skeleton */}
            <div className="flex justify-around items-center mb-8">
              <div className="w-12 h-12 rounded-full animate-pulse bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700" />
              <div className="w-24 h-8 rounded-full animate-pulse bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700" />
              <div className="w-12 h-12 rounded-full animate-pulse bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700" />
            </div>

            {/* Difficulty Skeleton */}
            <div className="flex flex-col items-center gap-3">
              <div className="h-4 w-32 rounded animate-pulse bg-slate-200 dark:bg-slate-700/50" />
              <div className="flex gap-3">
                <div className="w-20 h-10 rounded-lg animate-pulse bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700" />
                <div className="w-24 h-10 rounded-lg animate-pulse bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700" />
                <div className="w-20 h-10 rounded-lg animate-pulse bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
