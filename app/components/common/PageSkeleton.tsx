/**
 * PageSkeleton - Consistent Loading Skeleton Pattern
 * ✅ Provides a reusable skeleton component for consistent loading states across all pages
 */

interface PageSkeletonProps {
  /**
   * Number of skeleton items to display
   * @default 6
   */
  itemCount?: number;
  
  /**
   * Layout variant
   * @default "grid"
   */
  variant?: "grid" | "list" | "card";
  
  /**
   * Number of columns for grid layout
   * @default 3
   */
  columns?: number;
  
  /**
   * Show header skeleton
   * @default true
   */
  showHeader?: boolean;
  
  /**
   * Custom className
   */
  className?: string;
}

export default function PageSkeleton({
  itemCount = 6,
  variant = "grid",
  columns = 3,
  showHeader = true,
  className = "",
}: PageSkeletonProps) {
  const gridCols = variant === "grid" 
    ? `grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns}`
    : "";

  return (
    <div className={`space-y-6 ${className}`}>
      {showHeader && (
        <div className="space-y-4">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      )}

      {variant === "grid" && (
        <div className={`grid ${gridCols} gap-6`}>
          {Array.from({ length: itemCount }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-slate-200 dark:bg-slate-700" />
              <div className="p-6 space-y-4">
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="flex justify-between items-center pt-4">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === "list" && (
        <div className="space-y-4">
          {Array.from({ length: itemCount }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: itemCount }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 animate-pulse"
            >
              <div className="space-y-4">
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="h-5 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
