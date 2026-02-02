export default function NewsDetailSkeleton() {
  return (
    <main className="h-full bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-8 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl px-6 py-4 h-14 w-full animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2">
            <article className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-lg transition-colors duration-300">
              {/* Category Tag Skeleton */}
              <div className="h-7 w-24 bg-slate-200 dark:bg-slate-700/50 rounded mb-4 animate-pulse" />

              {/* Title Skeleton */}
              <div className="space-y-3 mb-6">
                <div className="h-10 w-full bg-slate-200 dark:bg-slate-700/50 rounded-lg animate-pulse" />
                <div className="h-10 w-4/5 bg-slate-200 dark:bg-slate-700/50 rounded-lg animate-pulse" />
              </div>

              {/* Meta Info Skeleton */}
              <div className="flex items-center gap-6 mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
              </div>

              {/* Image Skeleton */}
              <div className="mb-8 h-[400px] w-full bg-slate-200 dark:bg-slate-700/50 rounded-xl animate-pulse" />

              {/* Content Paragraphs Skeleton */}
              <div className="space-y-4 mb-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
                  </div>
                ))}
              </div>

              {/* CTA Banner Skeleton */}
              <div className="h-32 w-full bg-blue-200 dark:bg-blue-900/30 rounded-2xl animate-pulse" />
            </article>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Featured News Widget Skeleton */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg transition-colors duration-300">
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700/50 rounded mb-6 animate-pulse" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="pb-4 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                      <div className="h-5 w-full bg-slate-200 dark:bg-slate-700/50 rounded mb-2 animate-pulse" />
                      <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Banner Skeleton */}
              <div className="h-48 w-full bg-blue-200 dark:bg-blue-900/30 rounded-2xl animate-pulse" />

              {/* CTA Widget Skeleton */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg text-center transition-colors duration-300">
                <div className="h-16 w-16 bg-slate-200 dark:bg-slate-700/50 rounded-full mx-auto mb-4 animate-pulse" />
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700/50 rounded mx-auto mb-2 animate-pulse" />
                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700/50 rounded mx-auto mb-4 animate-pulse" />
                <div className="space-y-3">
                  <div className="h-10 w-full bg-slate-200 dark:bg-slate-700/50 rounded-lg animate-pulse" />
                  <div className="h-10 w-full bg-slate-200 dark:bg-slate-700/50 rounded-lg animate-pulse" />
                </div>
              </div>

              {/* Book Week Banner Skeleton */}
              <div className="h-32 w-full bg-amber-200 dark:bg-amber-900/30 rounded-2xl animate-pulse" />

              {/* Small Banners Skeleton */}
              <div className="space-y-3">
                <div className="h-12 w-full bg-slate-200 dark:bg-slate-700/50 rounded-xl animate-pulse" />
                <div className="h-12 w-full bg-slate-200 dark:bg-slate-700/50 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
