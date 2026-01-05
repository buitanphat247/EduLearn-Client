export default function ListeningFeatureSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 font-sans">
      <div className="container mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          {/* Breadcrumbs - Full width to match actual UI */}
          <div className="w-full h-14 bg-slate-800 rounded-xl mb-6 animate-pulse" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              {/* Title */}
              <div className="h-10 w-96 bg-slate-700 rounded-lg mb-2 animate-pulse" />
              {/* Subtitle/Progress */}
              <div className="h-5 w-48 bg-slate-800 rounded animate-pulse" />
            </div>
            {/* Back Button */}
            <div className="w-40 h-9 bg-slate-700 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN SKELETON */}
          <div className="lg:col-span-7 space-y-6">
            {/* Shortcuts Bar Skeleton */}
            <div className="h-14 bg-slate-800/50 rounded-lg w-full border border-slate-700/50 animate-pulse" />

            {/* Progress Badge */}
            <div className="h-6 w-24 bg-blue-900/50 rounded-full animate-pulse" />

            {/* Audio Player Skeleton */}
            <div className="bg-[#1e293b] rounded-2xl h-32 w-full border border-slate-700/50 p-6 flex items-center gap-5 animate-pulse">
              {/* Play Button Circle */}
              <div className="w-12 h-12 bg-slate-700 rounded-full shrink-0" />
              {/* Progress Bar & Time */}
              <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                  <div className="h-3 w-10 bg-slate-800 rounded" />
                  <div className="h-3 w-10 bg-slate-800 rounded" />
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full" />
              </div>
              {/* Controls */}
              <div className="w-20 h-8 bg-slate-700 rounded-lg shrink-0" />
            </div>

            {/* Input Area Skeleton */}
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-600 rounded-full" />
                <div className="h-6 w-40 bg-slate-700 rounded" />
              </div>

              {/* Textarea */}
              <div className="h-36 bg-[#1e293b] rounded-xl border border-slate-700/50 w-full" />

              {/* Buttons */}
              <div className="flex gap-3">
                <div className="h-11 w-32 bg-emerald-900/30 border border-emerald-900/50 rounded-lg" />
                <div className="h-11 w-32 bg-slate-800/50 border border-slate-700/50 rounded-lg" />
              </div>
            </div>

            {/* Result Box Skeleton */}
            <div className="h-32 bg-[#1e293b] rounded-2xl border border-slate-700/50 border-dashed w-full animate-pulse" />
          </div>

          {/* RIGHT COLUMN SKELETON - TRANSCRIPT */}
          <div className="lg:col-span-5 h-[calc(100vh-8rem)] sticky top-4">
            <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 h-full flex flex-col overflow-hidden animate-pulse">
              {/* Panel Header */}
              <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-[#1e293b]">
                <div className="h-6 w-24 bg-slate-700 rounded" />
                <div className="flex gap-2">
                  <div className="h-7 w-20 bg-slate-800 rounded-full" />
                  <div className="h-7 w-16 bg-slate-800 rounded-full" />
                </div>
              </div>
              {/* List Items */}
              <div className="p-4 space-y-3 flex-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-slate-800/30 rounded-xl w-full border border-slate-700/30 flex flex-col justify-center p-4 space-y-2"
                  >
                    <div className="h-3 w-full bg-slate-700/30 rounded" />
                    <div className="h-3 w-3/4 bg-slate-700/30 rounded" />
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
