"use client";

import { useState, useEffect, useMemo } from "react";
import { Avatar, Button, Spin, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EditOutlined,
  IdcardOutlined,
  CrownOutlined,
  SettingOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { getProfile } from "@/lib/api/auth";
import type { UserInfoResponse } from "@/lib/api/users";
import { useTheme } from "@/app/context/ThemeContext";

import ProfileSkeleton from "@/app/components/profile/ProfileSkeleton";

export default function Profile() {
  const [user, setUser] = useState<UserInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    let isMounted = true;

    const fetchUserInfo = async () => {
      try {
        // Lấy thông tin profile từ API (đọc từ cookie đã mã hóa)
        const userInfo = await getProfile();
        
        if (isMounted) {
          setUser(userInfo as UserInfoResponse);
          // Sync với localStorage
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("user", JSON.stringify(userInfo));
            } catch (error) {
              console.error("Error saving user to localStorage:", error);
            }
          }
        }
      } catch (error: any) {
        if (isMounted) {
          message.error(error.message || "Không thể tải thông tin user");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ Move useMemo hooks to top level (before early returns)
  const formattedCreatedAt = useMemo(() => {
    if (!user?.created_at) return "";
    const date = new Date(user.created_at);
    const day = date.getDate();
    const month = date.toLocaleDateString("vi-VN", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }, [user?.created_at]);

  const formattedUpdatedAt = useMemo(() => {
    if (!user?.updated_at) return "";
    const date = new Date(user.updated_at);
    const day = date.getDate();
    const month = date.toLocaleDateString("vi-VN", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }, [user?.updated_at]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
        <p className="text-slate-600 dark:text-slate-400">Không tìm thấy thông tin user</p>
      </div>
    );
  }

  const isAdmin = user.role?.role_name?.toLowerCase() === "admin";
  const cardClass =
    "bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 transition-colors duration-300";

  return (
    <div className="bg-slate-50 dark:bg-[#0f172a] py-12 px-4 relative overflow-hidden h-full transition-colors duration-500">
      {/* Decorative Blob */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto relative z-10 space-y-8">
        {/* Header Compact Card */}
        <div className="bg-white dark:bg-[#1e293b] rounded-[32px] p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 flex flex-col md:flex-row items-center gap-8 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden transition-colors duration-300">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

          {/* Avatar - Circle */}
          <div className="shrink-0 relative">
            <Avatar
              size={140}
              src={user.avatar}
              className="rounded-full shadow-2xl border-4 border-white dark:border-[#1e293b] flex items-center justify-center"
              style={{ backgroundColor: "#334155" }}
              icon={<UserOutlined style={{ fontSize: 70, color: "white" }} />}
            />
            {isAdmin && (
              <div className="absolute top-0 right-2 bg-yellow-400 text-yellow-900 rounded-full p-2 shadow-lg border-4 border-white dark:border-[#1e293b]">
                <CrownOutlined className="text-xl block" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left z-10">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight transition-colors duration-300">{user.fullname}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-4 flex flex-col md:flex-row items-center gap-2 md:gap-3 transition-colors duration-300">
              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">@{user.username}</span>
              <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="text-slate-500 dark:text-slate-400 text-base">{user.email}</span>
            </p>

            {/* Tags */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors duration-300 ${isAdmin
                  ? "border-red-500/20 text-red-500 dark:text-red-400 bg-red-500/10"
                  : "border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-500/10"
                  }`}
              >
                {user.role?.role_name || "Member"}
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 flex items-center gap-1.5 transition-colors duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Settings Card - Commented out */}
            {/* <div className={`${cardClass} p-5`}>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-700/50 transition-colors duration-300">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <SettingOutlined />
                </div>
                Cài đặt
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <BulbOutlined />
                    </div>
                    <div>
                      <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm">Giao diện</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{theme === "dark" ? "Chế độ tối" : "Chế độ sáng"}</p>
                    </div>
                  </div>
                  <ConfigProvider
                    theme={{
                      token: { colorPrimary: "#3b82f6" },
                    }}
                  >
                    <Switch checked={theme === "dark"} onChange={(_, e) => toggleTheme(e as any)} />
                  </ConfigProvider>
                </div>
              </div>
            </div> */}

            {/* Contact Card */}
            <div className={`${cardClass} p-5`}>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-700/50 transition-colors duration-300">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <MailOutlined />
                </div>
                Thông tin liên hệ
              </h3>

              <div className="space-y-1">
                <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-default">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <MailOutlined />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wide font-semibold mb-0.5">Email</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-default">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    <PhoneOutlined />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wide font-semibold mb-0.5">Số điện thoại</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">{user.phone || "Chưa cập nhật"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-default">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-purple-500/10 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    <IdcardOutlined />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wide font-semibold mb-0.5">User ID</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium font-mono">#{user.user_id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`${cardClass} p-8`}>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-3 transition-colors duration-300">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <IdcardOutlined />
                </div>
                Thông tin cá nhân
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="group">
                  <p className="text-slate-500 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Họ và tên
                  </p>
                  <p className="text-slate-900 dark:text-white text-lg font-medium border-b border-slate-200 dark:border-slate-700/50 pb-2 transition-colors duration-300">
                    {user.fullname}
                  </p>
                </div>

                <div className="group">
                  <p className="text-slate-500 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Username
                  </p>
                  <p className="text-slate-900 dark:text-white text-lg font-medium border-b border-slate-200 dark:border-slate-700/50 pb-2 transition-colors duration-300">
                    @{user.username}
                  </p>
                </div>

                <div className="group">
                  <p className="text-slate-500 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Email đăng ký
                  </p>
                  <p className="text-slate-900 dark:text-white text-lg font-medium border-b border-slate-200 dark:border-slate-700/50 pb-2 transition-colors duration-300">
                    {user.email}
                  </p>
                </div>

                <div className="group">
                  <p className="text-slate-500 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Vai trò hệ thống
                  </p>
                  <p className="text-slate-900 dark:text-white text-lg font-medium border-b border-slate-200 dark:border-slate-700/50 pb-2 flex items-center gap-2 transition-colors duration-300">
                    <span className={`w-2 h-2 rounded-full ${isAdmin ? "bg-red-500" : "bg-blue-500"}`}></span>
                    {user.role?.role_name || "Thành viên"}
                  </p>
                </div>

                <div className="group">
                  <p className="text-slate-500 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Ngày tham gia
                  </p>
                  <p className="text-slate-900 dark:text-white text-lg font-medium border-b border-slate-200 dark:border-slate-700/50 pb-2 flex items-center gap-2 transition-colors duration-300">
                    <CalendarOutlined className="text-slate-400 dark:text-slate-500" />
                    {formattedCreatedAt}
                  </p>
                </div>

                <div className="group">
                  <p className="text-slate-500 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Cập nhật lần cuối
                  </p>
                  <p className="text-slate-900 dark:text-white text-lg font-medium border-b border-slate-200 dark:border-slate-700/50 pb-2 flex items-center gap-2 transition-colors duration-300">
                    <CalendarOutlined className="text-slate-400 dark:text-slate-500" />
                    {formattedUpdatedAt}
                  </p>
                </div>
              </div>
            </div>

            {/* Activity or other sections could be added here */}
          </div>
        </div>
      </div>
    </div>
  );
}
