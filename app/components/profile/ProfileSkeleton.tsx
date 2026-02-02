
export default function ProfileSkeleton() {
  const cardClass =
    "bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 transition-colors duration-300";

  return (
    <div className="bg-slate-50 dark:bg-[#0f172a] py-12 px-4 relative overflow-hidden h-full transition-colors duration-500 animate-pulse">
      <div className="container mx-auto relative z-10 space-y-8">
        {/* Header Compact Card Skeleton */}
        <div className="bg-white dark:bg-[#1e293b] rounded-[32px] p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden">
          {/* Avatar Skeleton */}
          <div className="shrink-0 relative">
            <div className="w-[140px] h-[140px] rounded-full bg-slate-200 dark:bg-slate-700"></div>
          </div>
          
          {/* Info Skeleton */}
          <div className="flex-1 text-center md:text-left w-full">
            <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto md:mx-0 mb-4"></div>
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-md mx-auto md:mx-0 mb-6"></div>

            {/* Tags Skeleton */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column Skeleton */}
          <div className="space-y-6">
            {/* Contact Card Skeleton */}
            <div className={`${cardClass} p-5`}>
              <div className="h-7 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-14 w-full bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                <div className="h-14 w-full bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                <div className="h-14 w-full bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Personal Info Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`${cardClass} p-8`}>
              <div className="h-8 w-56 bg-slate-200 dark:bg-slate-700 rounded mb-8"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Field Skeletons */}
                {[...Array(6)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                    <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded border-b border-transparent"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
