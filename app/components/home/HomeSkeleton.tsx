"use client";

/**
 * HomeSkeleton - Loading skeleton for Home page
 * Matches the structure of Home page components
 */
export default function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-[#0f172a] transition-all duration-500 ease-in-out">
      {/* Hero Section Skeleton */}
      <section className="relative bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-white overflow-hidden pt-20 pb-32 transition-colors duration-500">
        <div className="container mx-auto px-4 md:px-10 relative z-10">
          <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
            {/* Left Content Skeleton */}
            <div className="flex-1 text-center md:text-left space-y-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-12 w-full max-w-2xl bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto md:mx-0" />
                <div className="h-12 w-3/4 max-w-xl bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto md:mx-0" />
                <div className="h-6 w-full max-w-lg bg-slate-200 dark:bg-slate-700 rounded mx-auto md:mx-0" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <div className="h-12 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-12 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              </div>
            </div>
            
            {/* Right Image Skeleton */}
            <div className="w-full md:w-1/2 lg:w-3/5 aspect-video md:aspect-4/3 lg:aspect-video rounded-xl overflow-hidden shadow-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section Skeleton */}
      <div className="border-b border-slate-200/60 dark:border-slate-800 transition-colors duration-500 py-12">
        <div className="container mx-auto px-4 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center space-y-2 animate-pulse">
                <div className="h-12 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto" />
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section Skeleton */}
      <div className="border-b border-slate-200/60 dark:border-slate-800 transition-colors duration-500 py-16">
        <div className="container mx-auto px-4 md:px-10">
          <div className="text-center mb-12 space-y-4 animate-pulse">
            <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto" />
            <div className="h-6 w-96 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-slate-200 dark:border-slate-700 space-y-4 animate-pulse">
                <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section Skeleton */}
      <div className="border-b border-slate-200/60 dark:border-slate-800 transition-colors duration-500 py-16">
        <div className="container mx-auto px-4 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-slate-200 dark:border-slate-700 space-y-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integrations Section Skeleton */}
      <div className="py-16">
        <div className="container mx-auto px-4 md:px-10">
          <div className="text-center mb-12 space-y-4 animate-pulse">
            <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto" />
            <div className="h-6 w-96 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-16 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
