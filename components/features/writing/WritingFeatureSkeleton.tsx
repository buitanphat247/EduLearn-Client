export default function WritingFeatureSkeleton() {
  return (
    <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column Skeleton */}
      <div className="lg:col-span-4">
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl relative overflow-hidden transition-colors duration-300">
          {/* Title Skeleton */}
          <div className="flex justify-center mb-6">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700/50 rounded-lg animate-pulse" />
          </div>

          <div className="space-y-6">
            {/* Language Field */}
            <div>
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700/50 rounded mb-2 animate-pulse" />
              <div className="h-10 w-full bg-slate-100 dark:bg-slate-700/30 rounded-lg animate-pulse" />
            </div>

            {/* Goal Field */}
            <div>
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700/50 rounded mb-2 animate-pulse" />
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 dark:bg-slate-700/30 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            {/* Method Field */}
            <div>
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700/50 rounded mb-2 animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 dark:bg-slate-700/30 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            {/* Topic Field */}
            <div>
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700/50 rounded mb-2 animate-pulse" />
              <div className="h-10 w-full bg-slate-100 dark:bg-slate-700/30 rounded-lg animate-pulse mb-3" />
              <div className="h-10 w-full bg-slate-100 dark:bg-slate-700/30 rounded-lg animate-pulse" />
            </div>

            {/* Submit Button */}
            <div className="h-11 w-full bg-slate-200 dark:bg-slate-700/50 rounded-xl animate-pulse mt-8" />
          </div>
        </div>
      </div>

      {/* Right Column Skeleton */}
      <div className="lg:col-span-8">
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl transition-colors duration-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-7 w-40 bg-slate-200 dark:bg-slate-700/50 rounded-lg animate-pulse" />
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700/50 rounded-full animate-pulse" />
          </div>

          {/* List Items */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700/30 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse" />
                </div>
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700/50 rounded animate-pulse mb-3" />
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-slate-100 dark:bg-slate-700/30 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Button */}
          <div className="w-full h-9 mt-4 bg-slate-50 dark:bg-slate-700/20 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
