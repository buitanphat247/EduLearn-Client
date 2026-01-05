import { ConfigProvider, theme } from "antd";

export default function VocabularyFlashcardSkeleton() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#3b82f6",
        },
      }}
    >
      <main className="min-h-screen bg-[#0f172a] py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Header & Breadcrumb Skeleton */}
          <div className="mb-8">
            <div className="mb-6 bg-[#1e293b] rounded-xl px-6 py-4 h-14 w-96 animate-pulse" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="h-10 w-64 bg-slate-700/50 rounded-lg animate-pulse" />
                <div className="h-5 w-48 bg-slate-800 rounded animate-pulse" />
              </div>

              <div className="w-36 h-9 bg-linear-to-r from-slate-700 to-slate-800 rounded-lg animate-pulse shadow-lg" />
            </div>
          </div>

          {/* Flashcard Area Skeleton */}
          <div className="flex flex-col items-center">
            {/* Main Card Skeleton */}
            <div className="w-full max-w-3xl mb-10 h-[450px] relative">
              <div className="absolute inset-0 bg-[#1e293b] rounded-3xl shadow-2xl border border-slate-700/50 p-8 flex flex-col items-center justify-center">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-14 w-48 bg-slate-700 rounded-lg animate-pulse" />
                  <div className="h-10 w-10 bg-slate-800 rounded-full animate-pulse" />
                </div>

                <div className="h-6 w-32 bg-slate-800 rounded-full animate-pulse mb-8" />

                <div className="h-12 w-48 bg-blue-900/20 rounded-full animate-pulse border border-blue-500/20" />
              </div>
            </div>

            {/* Controls Skeleton */}
            <div className="w-full max-w-3xl">
              {/* Navigation Skeleton */}
              <div className="flex justify-around items-center mb-8">
                <div className="w-24 h-12 bg-[#1e293b] rounded-lg animate-pulse border border-slate-800" />
                <div className="w-16 h-5 bg-slate-800 rounded animate-pulse" />
                <div className="w-24 h-12 bg-[#1e293b] rounded-lg animate-pulse border border-slate-800" />
              </div>

              {/* Difficulty Skeleton */}
              <div className="flex flex-col items-center gap-3">
                <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
                <div className="flex gap-3">
                  <div className="w-20 h-10 bg-[#1e293b] rounded-lg animate-pulse border border-slate-800" />
                  <div className="w-24 h-10 bg-[#1e293b] rounded-lg animate-pulse border border-slate-800" />
                  <div className="w-20 h-10 bg-[#1e293b] rounded-lg animate-pulse border border-slate-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ConfigProvider>
  );
}
