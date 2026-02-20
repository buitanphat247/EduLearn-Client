"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppstoreOutlined,
  ReadOutlined,
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import { IoBookOutline } from "react-icons/io5";
import { Button, App } from "antd";

const completedItems = [
  { path: "/admin", icon: AppstoreOutlined, label: "Trang chủ" },
  { path: "/admin/classes", icon: ReadOutlined, label: "Quản lý lớp học" },
  { path: "/admin/students", icon: UserOutlined, label: "Quản lý học sinh" },
  { path: "/admin/document-crawl", icon: FileTextOutlined, label: "Tài liệu hệ thống" },
  { path: "/admin/settings", icon: SettingOutlined, label: "Cài đặt" },
];

const pendingItems = [
  { path: "/admin/courses", icon: IoBookOutline, label: "Khóa học của tôi", isComingSoon: true },
  { path: "/admin/analytics", icon: BarChartOutlined, label: "Tổng quan khóa học", isComingSoon: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { message } = App.useApp();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleMenuItemClick = (item: { isComingSoon?: boolean }, e: React.MouseEvent) => {
    if (item.isComingSoon) {
      e.preventDefault();
      message.info("Tính năng đang phát triển");
      return;
    }
  };

  const renderSidebarItem = (item: any) => {
    const Icon = item.icon;
    const isExactMatch = item.path === "/admin";
    const isActive = isExactMatch ? pathname === "/admin" : pathname?.startsWith(item.path);

    const baseClasses = `group flex items-center gap-4 px-5 py-3 rounded-xl cursor-pointer w-full`;
    const inactiveClasses = `hover:bg-blue-50/80 dark:hover:bg-blue-900/15 opacity-90 hover:opacity-100`;

    const activeStyle: React.CSSProperties = isActive
      ? { backgroundColor: 'var(--sidebar-active-bg, #dbeafe)' }
      : {};

    if (item.isComingSoon) {
      return (
        <div
          key={item.path}
          onClick={(e) => handleMenuItemClick(item, e)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleMenuItemClick(item, e as any);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`${item.label} (Sắp ra mắt)`}
          className={`${baseClasses} ${isActive ? '' : inactiveClasses}`}
          style={activeStyle}
        >
          <Icon
            className={`text-xl ${isActive
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
              }`}
            aria-hidden="true"
          />
          <span
            className={`text-[14px] ${isActive
              ? "font-bold text-blue-600 dark:text-blue-400"
              : "font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:font-semibold"
              }`}
          >
            {item.label}
          </span>
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        href={item.path}
        prefetch={false}
        onMouseEnter={() => router.prefetch(item.path)}
        aria-label={`Điều hướng đến ${item.label}`}
        aria-current={isActive ? 'page' : undefined}
        className={`${baseClasses} ${isActive ? '' : inactiveClasses}`}
        style={activeStyle}
      >
        <Icon
          className={`text-xl ${isActive
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            }`}
          aria-hidden="true"
        />
        <span
          className={`text-[14px] ${isActive
            ? "font-bold text-blue-600 dark:text-blue-400"
            : "font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:font-semibold"
            }`}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <aside
      className="w-64 h-screen flex flex-col z-50 transition-all duration-300 border-r border-gray-100 dark:border-slate-700! bg-white dark:bg-gray-900"
      aria-label="Admin navigation sidebar"
    >
      {/* Logo Section */}
      <div className="p-4 pb-6 flex items-center gap-3">
        <div
          className="w-10 h-10 bg-linear-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
          aria-hidden="true"
        >
          <span className="text-white text-lg font-bold tracking-tighter">AIO</span>
        </div>
        <span className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tighter capitalize">Edu Learning</span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="flex items-center px-2 mb-3 mt-2">
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
          <span className="px-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Hệ thống quản lý</span>
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
        </div>
        {completedItems.map(renderSidebarItem)}

        <div className="flex items-center px-2 mb-3 mt-6">
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
          <span className="px-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Đang phát triển</span>
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
        </div>
        {pendingItems.map(renderSidebarItem)}
      </nav>

      {/* Go Home Button */}
      <div className="p-4">
        <Button
          size="large"
          type="primary"
          danger
          onClick={handleGoHome}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleGoHome();
            }
          }}
          aria-label="Thoát hệ thống và quay về trang chủ"
          className="w-full"
        >
          <LogoutOutlined className="text-xl transition-colors duration-200" aria-hidden="true" />
          <span>Thoát hệ thống</span>
        </Button>
      </div>
    </aside>
  );
}
