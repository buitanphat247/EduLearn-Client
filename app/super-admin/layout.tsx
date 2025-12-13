"use client";

import SuperAdminSidebar from "../components/layout/SuperAdminSidebar";
import DashboardFooter from "../components/layout/DashboardFooter";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BellOutlined, RobotOutlined } from "@ant-design/icons";
import NotificationPanel from "../components/layout/NotificationPanel";
import AIChatPanel from "../components/layout/AIChatPanel";

const pageTitles: Record<string, string> = {
  "/super-admin": "Dashboard",
  "/super-admin/documents-crawl": "Quản lý tài liệu Crawl",
  "/super-admin/documents-user": "Quản lý tài liệu User",
  "/super-admin/accounts": "Quản lý tài khoản",
  "/super-admin/notification": "Quản lý thông báo",
  "/super-admin/posts": "Quản lý tin tức",
  "/super-admin/events": "Quản lý toàn bộ sự kiện",
  "/super-admin/all": "Quản lý toàn bộ",
};

function SuperAdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const currentPageTitle = pageTitles[pathname || ""];

  return (
    <>
      <header className="bg-white h-16 flex items-center justify-between px-6 shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-800">Hệ thống quản lý Super Admin</h1>
          {currentPageTitle && (
            <>
              <span className="text-gray-500">-</span>
              <span className="text-lg font-semibold text-gray-800">{currentPageTitle}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAIChatOpen(true)}
            className="text-gray-600 hover:text-gray-800 transition-colors relative"
            title="Trợ lý AI"
          >
            <RobotOutlined className="text-2xl" />
          </button>
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="text-gray-600 hover:text-gray-800 transition-colors relative"
          >
            <BellOutlined className="text-2xl" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div
            onClick={() => router.push("/profile")}
            className="flex items-center gap-3 pl-4 border-l border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              SA
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">Super Admin</span>
              <span className="text-xs text-gray-600">Quản trị viên</span>
            </div>
          </div>
        </div>
      </header>
      <NotificationPanel open={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
      <AIChatPanel open={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </>
  );
}

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        <SuperAdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <SuperAdminHeader />
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
          <DashboardFooter />
        </div>
      </div>
    </ProtectedRoute>
  );
}

