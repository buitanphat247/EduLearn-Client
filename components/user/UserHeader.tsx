"use client";

import { useRouter, usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/user": "Trang chủ",
  "/user/classes": "Lớp học",
};

export default function UserHeader() {
  const router = useRouter();
  const pathname = usePathname();

  // Find matching page title, checking for exact match first, then prefix match
  const getCurrentPageTitle = () => {
    if (!pathname) return undefined;
    
    // Check exact match first
    if (pageTitles[pathname]) {
      return pageTitles[pathname];
    }
    
    // Check prefix match for nested routes
    for (const [route, title] of Object.entries(pageTitles)) {
      if (route !== "/user" && pathname.startsWith(route)) {
        return title;
      }
    }
    
    return undefined;
  };

  const currentPageTitle = getCurrentPageTitle();

  return (
    <>
      <header className="bg-white h-16 flex items-center justify-between px-6 shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-800">Hệ thống học tập</h1>
          {currentPageTitle && (
            <>
              <span className="text-gray-500">-</span>
              <span className="text-lg font-semibold text-gray-800">{currentPageTitle}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div
            onClick={() => router.push("/profile")}
            className="flex items-center gap-3 pl-4 border-l border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              HS
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">Học sinh</span>
              <span className="text-xs text-gray-600">Lớp 9A3</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

