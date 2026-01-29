"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import AdminSidebar from "../components/layout/AdminSidebar";
import { usePathname } from "next/navigation";
import { Modal, Spin, message, Switch } from "antd";
import { getUserInfo, type UserInfoResponse } from "@/lib/api/users";
import { useUserId } from "@/app/hooks/useUserId";
import { useTheme } from "@/app/context/ThemeContext";
import { MoonOutlined, SunOutlined, BulbOutlined, BulbFilled } from "@ant-design/icons";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/classes": "Quản lý Lớp học",
  "/admin/students": "Quản lý Học sinh",
  "/admin/document-crawl": "Quản lý Tài liệu Crawl",
};

interface InitialUserData {
  username: string | null;
  role_name: string | null;
  avatar: string | null;
}

function AdminHeader({ initialUserData }: { initialUserData: InitialUserData | null }) {
  const pathname = usePathname();
  const { userId } = useUserId();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Memoize page title calculation
  const currentPageTitle = useMemo(() => {
    if (!pathname) return undefined;
    if (pageTitles[pathname]) return pageTitles[pathname];
    for (const [route, title] of Object.entries(pageTitles)) {
      if (route !== "/admin" && pathname.startsWith(route)) return title;
    }
    return undefined;
  }, [pathname]);

  // Memoize fetch function
  const fetchUserInfo = useCallback(async (showError = false) => {
    if (!userId) {
      if (showError) message.error("Không tìm thấy thông tin người dùng");
      return;
    }

    if (showError) setLoadingProfile(true);
    try {
      const user = await getUserInfo(userId);
      setUserInfo(user);
    } catch (error: any) {
      if (showError) {
        message.error(error?.message || "Không thể tải thông tin người dùng");
      }
      console.error("Error fetching user info:", error);
    } finally {
      if (showError) setLoadingProfile(false);
    }
  }, [userId, message]);

  // Fetch user info on mount (silent)
  useEffect(() => {
    fetchUserInfo(false);
  }, [fetchUserInfo]);

  // Fetch user info when modal opens (with loading state)
  useEffect(() => {
    if (!isProfileModalOpen || userInfo) return;
    fetchUserInfo(true);
  }, [isProfileModalOpen, userInfo, fetchUserInfo]);

  // Memoize getInitials function
  const getInitials = useCallback((name: string) => {
    if (!name) return "A";
    const parts = name.trim().split(" ");
    return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  }, []);

  // Memoize display values
  const displayName = useMemo(() => userInfo?.username || initialUserData?.username || "Admin", [userInfo?.username, initialUserData?.username]);
  const displayRole = useMemo(
    () => userInfo?.role?.role_name || initialUserData?.role_name || "Giáo viên",
    [userInfo?.role?.role_name, initialUserData?.role_name],
  );

  // Memoize initials for avatar
  const displayInitials = useMemo(() => getInitials(displayName), [displayName, getInitials]);

  return (
    <>
      <header className="bg-white dark:bg-gray-900 h-16 flex items-center justify-between px-6 shadow-none transition-colors duration-300 border-b border-gray-100 dark:border-slate-700!">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Hệ thống quản lý Admin</h1>
          {currentPageTitle && (
            <>
              <span className="text-gray-500">-</span>
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">{currentPageTitle}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={(e) => toggleTheme(e)}
            className="theme-toggle-btn"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <BulbFilled /> : <BulbOutlined />}
          </button>
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-3 pl-4 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">{displayInitials}</div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{displayName}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{displayRole}</span>
            </div>
          </div>
        </div>
      </header>

      <Modal title="Hồ sơ giáo viên" open={isProfileModalOpen} onCancel={() => setIsProfileModalOpen(false)} footer={null} width={600}>
        <Spin spinning={loadingProfile}>
          {userInfo ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {getInitials(userInfo.fullname || userInfo.username || "A")}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{userInfo.fullname || userInfo.username}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{userInfo.role?.role_name || "Giáo viên"}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tên đăng nhập:</span>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{userInfo.username || "Chưa cập nhật"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{userInfo.email || "Chưa cập nhật"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Số điện thoại:</span>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{userInfo.phone || "Chưa cập nhật"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Ngày tạo:</span>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    {userInfo.created_at ? new Date(userInfo.created_at).toLocaleDateString("vi-VN") : "Chưa có thông tin"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Không có thông tin</div>
          )}
        </Spin>
      </Modal>
    </>
  );
}

export default function AdminLayoutClient({ children, initialUserData }: { children: React.ReactNode; initialUserData: InitialUserData | null }) {
  const pathname = usePathname();
  const isDocumentCrawlPage = pathname?.startsWith("/admin/document-crawl");

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 overflow-hidden transition-colors duration-300">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader initialUserData={initialUserData} />
        <main className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300`}>{children}</main>
      </div>
    </div>
  );
}
