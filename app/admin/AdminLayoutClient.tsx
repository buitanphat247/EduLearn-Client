"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import AdminSidebar from "../components/layout/AdminSidebar";
import { usePathname } from "next/navigation";
import { Spin, message, Modal, Avatar } from "antd";
import { getUserInfo, type UserInfoResponse } from "@/lib/api/users";
import { getMediaUrl } from "@/lib/utils/media";
import { getCachedImageUrl } from "@/lib/utils/image-cache";
import { useUserId } from "@/app/hooks/useUserId";
import NotificationBell from "@/app/components/notifications/NotificationBell";
import { ServerAuthedUserProvider } from "../context/ServerAuthedUserProvider";

const pageTitles: Record<string, string> = {
  "/admin": "Trang chủ",
  "/admin/classes": "Quản lý lớp học",
  "/admin/students": "Quản lý học sinh",
  "/admin/document-crawl": "Tài liệu hệ thống",
  "/admin/settings": "Cài đặt",
};

interface InitialUserData {
  user_id?: number | string | null;
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
  const [imgError, setImgError] = useState(false);
  const [mounted, setMounted] = useState(false);

  const FALLBACK_CAT = getMediaUrl("/avatars/anh3_1770318347807_gt8xnc.jpeg");

  useEffect(() => {
    setMounted(true);
  }, []);

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

    let isMounted = true;
    if (showError) setLoadingProfile(true);

    try {
      const user = await getUserInfo(userId);
      if (isMounted) {
        setUserInfo(user);
      }
    } catch (error: unknown) {
      if (isMounted) {
        const errorMessage = error instanceof Error
          ? error.message
          : "Không thể tải thông tin người dùng";
        if (showError) {
          message.error(errorMessage);
        }
        console.error("Error fetching user info:", error);
      }
    } finally {
      if (isMounted && showError) {
        setLoadingProfile(false);
      }
    }
  }, [userId]);

  const fetchUserInfoRef = useRef(fetchUserInfo);
  fetchUserInfoRef.current = fetchUserInfo;

  // Fetch user info when userId becomes available
  useEffect(() => {
    if (!userId) return;
    fetchUserInfoRef.current(false);
  }, [userId]);

  useEffect(() => {
    if (!isProfileModalOpen || userInfo) return;
    fetchUserInfoRef.current(true);
  }, [isProfileModalOpen, userInfo]);

  // Handle user-updated event to sync avatar
  useEffect(() => {
    const handleUpdate = () => {
      fetchUserInfo(false);
    };
    window.addEventListener("user-updated", handleUpdate);
    return () => window.removeEventListener("user-updated", handleUpdate);
  }, [fetchUserInfo]);

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

  const formattedCreatedAt = useMemo(() => {
    if (!userInfo?.created_at) return "Chưa có thông tin";
    const date = new Date(userInfo.created_at);
    const day = date.getDate();
    const month = date.toLocaleDateString("vi-VN", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }, [userInfo?.created_at]);

  const avatarUrl = useMemo(() => {
    // Server safe URL calculation
    if (imgError) return FALLBACK_CAT;
    const url = userInfo?.avatar || initialUserData?.avatar;
    return url ? getMediaUrl(url) : FALLBACK_CAT;
  }, [userInfo?.avatar, initialUserData?.avatar, imgError]);

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
          <NotificationBell userId={userId!} />
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-3 pl-4 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Avatar
              size={40}
              src={mounted ? getCachedImageUrl(avatarUrl) : avatarUrl}
              onError={() => {
                setImgError(true);
                return true;
              }}
              className="flex items-center justify-center bg-blue-600"
            >
              {displayInitials}
            </Avatar>
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
                <Avatar
                  size={80}
                  src={mounted ? getCachedImageUrl((imgError || !userInfo.avatar) ? FALLBACK_CAT : getMediaUrl(userInfo.avatar)) : ((imgError || !userInfo.avatar) ? FALLBACK_CAT : getMediaUrl(userInfo.avatar))}
                  className="flex items-center justify-center bg-blue-600"
                >
                  {getInitials(userInfo.fullname || userInfo.username || "A")}
                </Avatar>
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
                    {formattedCreatedAt}
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
  // Create provider user object
  const serverUser = useMemo(() => {
    if (!initialUserData) return null;
    return {
      userId: initialUserData.user_id || null,
      username: initialUserData.username,
      roleName: initialUserData.role_name,
      avatar: initialUserData.avatar
    };
  }, [initialUserData]);

  return (
    <ServerAuthedUserProvider user={serverUser}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-950 overflow-hidden transition-colors duration-300">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader initialUserData={initialUserData} />
          <main className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300`}>{children}</main>
        </div>
      </div>
    </ServerAuthedUserProvider>
  );
}
