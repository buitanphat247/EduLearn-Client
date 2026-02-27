export default function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Profile Information Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-none dark:shadow-sm transition-colors duration-200 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>

        <div className="flex items-start gap-6 mb-6">
          <div className="w-[100px] h-[100px] rounded-full bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex-1 space-y-3">
            <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-700 mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>

      {/* Notification Settings Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-none dark:shadow-sm transition-colors duration-200 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-600">
              <div className="flex-1 space-y-2">
                <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>

      {/* Security Settings Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-none dark:shadow-sm transition-colors duration-200 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-600">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          </div>
        </div>

        <div className="mt-6">
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>

      {/* Change Password Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-none dark:shadow-sm transition-colors duration-200 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}
