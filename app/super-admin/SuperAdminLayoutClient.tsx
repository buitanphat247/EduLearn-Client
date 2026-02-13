"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import SuperAdminSidebar from "../components/layout/SuperAdminSidebar";
import { usePathname } from "next/navigation";
import { Modal, Spin, message, Breadcrumb, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getUserInfo, type UserInfoResponse } from "@/lib/api/users";
import { useUserId } from "@/app/hooks/useUserId";
import Link from "next/link";
import { ServerAuthedUserProvider } from "../context/ServerAuthedUserProvider";
import { useUserProfile } from "@/app/hooks/useUserProfile";

const pageTitles: Record<string, string> = {
  "/super-admin": "Dashboard",
  "/super-admin/documents-crawl": "Quản lý tài liệu",
  "/super-admin/accounts": "Quản lý tài khoản",
  "/super-admin/notification": "Quản lý thông báo",
  "/super-admin/posts": "Quản lý tin tức",
  "/super-admin/events": "Quản lý sự kiện",
  "/super-admin/permissions": "Quản lý phân quyền",
  "/super-admin/all": "Quản lý toàn bộ",
};

interface InitialUserData {
  user_id?: number | string | null;
  username: string | null;
  role_name: string | null;
  avatar: string | null;
}

function SuperAdminHeader({ initialUserData }: { initialUserData: InitialUserData | null }) {
  const pathname = usePathname();
  // Use the new hook
  const { userInfo, loading: loadingProfile, fetchUserInfo } = useUserProfile();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const getBreadcrumbItems = useMemo(() => {
    const items = [
      {
        title: <Link href="/super-admin">Hệ thống quản lý Super Admin</Link>,
      },
    ];

    if (pathname && pathname !== "/super-admin") {
      const title = pageTitles[pathname];
      if (title) {
        items.push({
          title: <span className="font-semibold text-gray-800">{title}</span>,
        });
      }
    }

    return items;
  }, [pathname]);

  useEffect(() => {
    if (isProfileModalOpen && !userInfo) {
      fetchUserInfo(true);
    }
  }, [isProfileModalOpen, userInfo, fetchUserInfo]);

  const getInitials = useCallback((name: string) => {
    if (!name) return "SA";
    const parts = name.trim().split(" ");
    return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  }, []);

  const displayName = useMemo(
    () => userInfo?.username || initialUserData?.username || "Super Admin",
    [userInfo?.username, initialUserData?.username],
  );
  const displayRole = useMemo(
    () => userInfo?.role?.role_name || initialUserData?.role_name || "Quản trị viên",
    [userInfo?.role?.role_name, initialUserData?.role_name],
  );

  const displayInitials = useMemo(() => getInitials(displayName), [displayName, getInitials]);

  return (
    <>
      <header className="bg-white dark:bg-gray-900 h-16 flex items-center justify-between px-6 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="flex items-center gap-2">
          {/* Include dark mode specific classes for breadcrumbs via global styles or parent config, 
              but usually AntD breadcrumbs need ConfigProvider theme. 
              Here we just trust standard AntD dark theme or wrapper class. */}
          <Breadcrumb items={getBreadcrumbItems} className="dark:text-gray-300" />
        </div>

        <div className="flex items-center gap-4">
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-3 pl-4 border-l border-gray-300 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="relative p-0.5 rounded-full bg-blue-500 dark:bg-blue-600">
              <Avatar
                size={40}
                className="flex items-center justify-center bg-blue-600"
                icon={<UserOutlined style={{ fontSize: 20, color: '#ffffff' }} />}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{displayName}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{displayRole}</span>
            </div>
          </div>
        </div>
      </header>

      <Modal title="Hồ sơ quản trị viên" open={isProfileModalOpen} onCancel={() => setIsProfileModalOpen(false)} footer={null} width={600}>
        <Spin spinning={loadingProfile}>
          {userInfo ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative p-1 rounded-full bg-blue-500 dark:bg-blue-600">
                  <Avatar
                    size={80}
                    className="flex items-center justify-center bg-blue-600"
                    icon={<UserOutlined style={{ fontSize: 40, color: '#ffffff' }} />}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{userInfo.fullname || userInfo.username}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{userInfo.role?.role_name || "Quản trị viên"}</p>
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
            <div className="text-center py-8 text-gray-500">Không có thông tin</div>
          )}
        </Spin>
      </Modal>
    </>
  );
}

export default function SuperAdminLayoutClient({
  children,
  initialUserData,
}: {
  children: React.ReactNode;
  initialUserData: InitialUserData | null;
}) {
  const pathname = usePathname();
  const isDocumentCrawlPage = pathname === "/super-admin/documents-crawl";

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
      <div className="super-admin flex h-screen bg-gray-100 dark:bg-zinc-900 overflow-hidden transition-colors duration-300">
        <SuperAdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <SuperAdminHeader initialUserData={initialUserData} />
          <main className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-black p-6 ${isDocumentCrawlPage ? "pb-0" : ""} transition-colors duration-300`}>
            {children}
          </main>
        </div>
      </div>
    </ServerAuthedUserProvider>
  );
}
