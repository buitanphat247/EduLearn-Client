"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppstoreOutlined, ReadOutlined, UserOutlined, FileTextOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import { IoBookOutline } from "react-icons/io5";
import { Button, App } from "antd";

const menuItems = [
  { path: "/admin", icon: AppstoreOutlined, label: "Dashboard" },
  { path: "/admin/classes", icon: ReadOutlined, label: "Quản lí lớp học" },
  { path: "/admin/students", icon: UserOutlined, label: "Quản lí học sinh" },
  { path: "/admin/courses", icon: IoBookOutline, label: "Quản lí khóa học", isComingSoon: true },
  { path: "/admin/document-crawl", icon: FileTextOutlined, label: "Tài liệu hệ thống" },
  { path: "/admin/settings", icon: SettingOutlined, label: "Cài đặt" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { message } = App.useApp();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleMenuItemClick = (item: typeof menuItems[0], e: React.MouseEvent) => {
    if (item.isComingSoon) {
      e.preventDefault();
      message.info("Tính năng đang phát triển");
      return;
    }
  };

  return (
    <aside className="w-64 h-screen flex flex-col z-50 transition-all duration-300 border-r border-gray-100 dark:!border-slate-700 bg-white dark:bg-gray-900">
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
          const isExactMatch = item.path === "/admin";
          const isActive = isExactMatch ? pathname === "/admin" : pathname?.startsWith(item.path);

          return (
            <div
              key={item.path}
              className={`group flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 ease-in-out ${
                isActive 
                  ? "bg-blue-100 dark:bg-blue-900/40" 
                  : "hover:bg-blue-50/80 dark:hover:bg-blue-900/15 hover:opacity-100 opacity-90 cursor-pointer"
              }`}
            >
              {item.isComingSoon ? (
                <div onClick={(e) => handleMenuItemClick(item, e)} className="flex items-center gap-4 w-full cursor-pointer">
                  <Icon
                    className={`text-xl transition-all duration-300 ${
                      isActive 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    }`}
                  />
                  <span
                    className={`text-[14px] transition-all duration-300 ${
                      isActive 
                        ? "font-bold text-blue-600 dark:text-blue-400" 
                        : "font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:font-semibold"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ) : (
                <Link href={item.path} className="flex items-center gap-4 w-full">
                  <Icon
                    className={`text-xl transition-all duration-300 ${
                      isActive 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    }`}
                  />
                  <span
                    className={`text-[14px] transition-all duration-300 ${
                      isActive 
                        ? "font-bold text-blue-600 dark:text-blue-400" 
                        : "font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:font-semibold"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              )}
            </div>
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
