"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
  HomeOutlined,
  FileTextOutlined,
  TeamOutlined,
  ReadOutlined,
  MessageOutlined,
  SettingOutlined,
  BarChartOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { useSidebarColor } from "@/app/contexts/SidebarColorContext";

const menuItems = [
  { path: "/user", icon: HomeOutlined, label: "Trang chủ" },
  { path: "/user/exercises", icon: FileTextOutlined, label: "Bài tập" },
  { path: "/user/grades", icon: BarChartOutlined, label: "Bảng điểm" },
  { path: "/user/community", icon: TeamOutlined, label: "Cộng đồng" },
  { path: "/user/documents", icon: ReadOutlined, label: "Tài liệu" },
  { path: "/user/chat", icon: MessageOutlined, label: "Tin nhắn" },
  { path: "/user/profile", icon: IdcardOutlined, label: "Hồ sơ" },
];

const sidebarColors = [
  { key: "#2f3542", label: "Xám đậm", color: "#2f3542" },
  { key: "#1e293b", label: "Xám đen", color: "#1e293b" },
  { key: "#0f172a", label: "Đen", color: "#0f172a" },
  { key: "#1e40af", label: "Xanh dương", color: "#1e40af" },
  { key: "#7c3aed", label: "Tím", color: "#7c3aed" },
  { key: "#059669", label: "Xanh lá", color: "#059669" },
  { key: "#dc2626", label: "Đỏ", color: "#dc2626" },
  { key: "#ea580c", label: "Cam", color: "#ea580c" },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const { sidebarColor, setSidebarColor } = useSidebarColor();

  const colorMenuItems: MenuProps["items"] = sidebarColors.map((item) => ({
    key: item.key,
    label: (
      <div className="flex items-center gap-3">
        <div
          className="w-5 h-5 rounded border border-gray-300"
          style={{ backgroundColor: item.color }}
        />
        <span>{item.label}</span>
      </div>
    ),
    onClick: () => setSidebarColor(item.color),
  }));

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
          const isExactMatch = item.path === "/user";
          const isActive = isExactMatch 
            ? pathname === "/user"
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
        <Dropdown
          menu={{ items: colorMenuItems }}
          placement="topRight"
          arrow
          classNames={{ root: "sidebar-color-dropdown" }}
        >
          <button
            className="flex items-center justify-center py-2 px-2 rounded-lg transition-colors"
            style={{ backgroundColor: "transparent" }}
            title="Cài đặt"
          >
            <SettingOutlined className="text-xl" style={{ color: "#ffffff" }} />
          </button>
        </Dropdown>
      </div>
    </aside>
  );
}

