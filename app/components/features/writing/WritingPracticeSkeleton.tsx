export default function WritingPracticeSkeleton() {
  return (
    <div className="bg-[#0f172a] py-8">
      <div className="container mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          {/* Breadcrumbs */}
          <div className="w-full h-14 bg-slate-800 rounded-xl mb-6 animate-pulse" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              {/* Title */}
              <div className="w-64 h-10 bg-slate-700 rounded-lg mb-3 animate-pulse" />
              {/* Stats */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-6 bg-slate-800 rounded animate-pulse" />
                <div className="w-24 h-6 bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
            {/* Back Button */}
            <div className="w-32 h-10 bg-slate-700 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton */}
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Dialogue Skeleton */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl shadow-xl overflow-hidden h-[500px] p-4">
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-full h-24 bg-slate-800/30 rounded-xl animate-pulse border border-slate-700/30 p-3 space-y-2"
                  >
                    <div className="w-16 h-3 bg-slate-700/50 rounded animate-pulse" />
                    <div className="w-full h-4 bg-slate-700/30 rounded animate-pulse" />
                    <div className="w-3/4 h-4 bg-slate-700/30 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Transcript Skeleton */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700 overflow-hidden h-[500px] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <div className="w-24 h-5 bg-slate-700 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="w-24 h-8 bg-slate-800 rounded-full animate-pulse" />
                  <div className="w-20 h-8 bg-slate-800 rounded-full animate-pulse" />
                </div>
              </div>
              {/* List */}
              <div className="p-4 space-y-3 flex-1 overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-full h-24 bg-slate-800/30 rounded-xl animate-pulse border border-slate-700/30 p-3 space-y-2">
                    <div className="w-16 h-3 bg-slate-700/50 rounded animate-pulse" />
                    <div className="w-full h-4 bg-slate-700/30 rounded animate-pulse" />
                    <div className="w-3/4 h-4 bg-slate-700/30 rounded animate-pulse" />
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
            <div className="w-12 h-12 bg-slate-800 rounded-full animate-pulse shadow-lg" />
          </div>

          {/* Center Input Skeleton */}
          <div className="flex-1 h-14 bg-slate-800/80 rounded-3xl animate-pulse shadow-xl border border-slate-700/50" />

          {/* Right Button Skeleton */}
          <div className="pb-1">
            <div className="w-12 h-12 bg-slate-700 rounded-full animate-pulse shadow-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
