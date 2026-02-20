"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeOutlined,
  BellOutlined,
  UserOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  CalendarOutlined,
  CloudDownloadOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, App } from "antd";

const menuItems = [
  { path: "/super-admin", icon: HomeOutlined, label: "Trang chủ" },
  { path: "/super-admin/documents-crawl", icon: CloudDownloadOutlined, label: "Quản lý tài liệu" },
  { path: "/super-admin/accounts", icon: UserOutlined, label: "Quản lý tài khoản" },
  { path: "/super-admin/notification", icon: BellOutlined, label: "Quản lý thông báo" },
  { path: "/super-admin/posts", icon: FileTextOutlined, label: "Quản lý tin tức" },
  { path: "/super-admin/events", icon: CalendarOutlined, label: "Quản lý sự kiện" },
  { path: "/super-admin/permissions", icon: SafetyCertificateOutlined, label: "Phân quyền" },
  { path: "/super-admin/all", icon: DatabaseOutlined, label: "Quản lý toàn bộ" },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { message } = App.useApp();
  const isNotificationPage = pathname?.startsWith("/super-admin/notification");

  const handleGoHome = () => {
    router.push("/");
  };

  const handleFastRefresh = () => {
    // Dispatch custom event to refresh notifications
    window.dispatchEvent(new CustomEvent("refresh-notifications"));
    message.success("Đang làm mới thông báo...");
  };

  return (
    <aside className="w-64 h-screen flex flex-col z-50 transition-all duration-300 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Logo Section */}
      <div className="p-4 pb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-linear-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white text-lg font-bold tracking-tighter">AIO</span>
        </div>
        <span className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tighter capitalize">Edu Learning</span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isExactMatch = item.path === "/super-admin";
          const isActive = isExactMatch ? pathname === "/super-admin" : pathname?.startsWith(item.path);
          const isNotificationItem = item.path === "/super-admin/notification";

          const baseClasses = `group flex items-center gap-4 px-5 py-3 rounded-xl cursor-pointer w-full`;
          const inactiveClasses = `hover:bg-blue-50/80 dark:hover:bg-blue-900/15 opacity-90 hover:opacity-100`;

          const activeStyle: React.CSSProperties = isActive
            ? { backgroundColor: 'var(--sidebar-active-bg, #dbeafe)' }
            : {};

          return (
            <Link
              key={item.path}
              href={item.path}
              prefetch={false}
              onMouseEnter={() => router.prefetch(item.path)}
              className={`${baseClasses} ${isActive ? '' : inactiveClasses}`}
              style={activeStyle}
            >
              <Icon
                className={`text-xl ${isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  }`}
              />
              <span
                className={`text-[14px] flex-1 ${isActive
                    ? "font-bold text-blue-600 dark:text-blue-400"
                    : "font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:font-semibold"
                  }`}
              >
                {item.label}
              </span>
              {isNotificationItem && isNotificationPage && (
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFastRefresh();
                  }}
                  className="ml-auto opacity-70 hover:opacity-100 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Làm mới thông báo"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Go Home Button */}
      <div className="p-4">
        <Button size="large" type="primary" danger onClick={handleGoHome} className="w-full">
          <LogoutOutlined className="text-xl transition-colors duration-200" />
          <span>Thoát hệ thống</span>
        </Button>
      </div>
    </aside>
  );
}
