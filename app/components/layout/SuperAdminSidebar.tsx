"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeOutlined,
  SettingOutlined,
  ReadOutlined,
  BellOutlined,
  UserOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  CalendarOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
const menuItems = [
  { path: "/super-admin", icon: HomeOutlined, label: "Trang chủ" },
  { path: "/super-admin/documents-crawl", icon: CloudDownloadOutlined, label: "Tài liệu Crawl" },
  { path: "/super-admin/documents-user", icon: ReadOutlined, label: "Tài liệu User" },
  { path: "/super-admin/accounts", icon: UserOutlined, label: "Quản lý tài khoản" },
  { path: "/super-admin/news", icon: BellOutlined, label: "Quản lý toàn bộ tin tức" },
  { path: "/super-admin/posts", icon: FileTextOutlined, label: "Quản lý toàn bộ bài viết" },
  { path: "/super-admin/events", icon: CalendarOutlined, label: "Quản lý toàn bộ sự kiện" },
  { path: "/super-admin/all", icon: DatabaseOutlined, label: "Quản lý toàn bộ" },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const sidebarColor = "#2f3542";

  return (
    <aside
      className="w-24 flex flex-col items-center py-4"
      style={{ backgroundColor: sidebarColor, "--sidebar-bg": sidebarColor } as React.CSSProperties & { "--sidebar-bg": string }}
    >
      {/* Logo */}
      <div className="mb-5">
        <div className="w-14 h-14 bg-white border border-gray-300 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
          <img src="/images/logo/1.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 flex flex-col gap-2 w-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isExactMatch = item.path === "/super-admin";
          const isActive = isExactMatch 
            ? pathname === "/super-admin"
            : pathname?.startsWith(item.path);
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center justify-center py-3 px-2 rounded-l-2xl transition-all group relative ${isActive ? "admin-sidebar-active" : ""}`}
              style={{ backgroundColor: "transparent" }}
              title={item.label}
            >
              <Icon className="text-2xl" style={{ color: "#ffffff", position: "relative", zIndex: 2 }} />
            </Link>
          );
        })}
      </nav>

      {/* Utility Icons */}
      <div className="flex flex-col gap-2 w-full mt-auto px-2">
        <button
          className="flex items-center justify-center py-2 px-2 rounded-lg transition-colors"
          style={{ backgroundColor: "transparent" }}
          title="Cài đặt"
        >
          <SettingOutlined className="text-xl" style={{ color: "#ffffff" }} />
        </button>
      </div>
    </aside>
  );
}

