"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, Button, Spin, message, Tag } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EditOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { getUserInfo, getCurrentUser } from "@/lib/api/users";
import type { UserInfoResponse } from "@/lib/api/users";

export default function Profile() {
  const [user, setUser] = useState<UserInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;

    const fetchUserInfo = async () => {
      hasFetched.current = true;
      try {
        const currentUser = getCurrentUser();
        if (currentUser?.user_id) {
          const userInfo = await getUserInfo(currentUser.user_id);
          setUser(userInfo);
        } else {
          setLoading(false);
        }
      } catch (error: any) {
        message.error(error.message || "Không thể tải thông tin user");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <p className="text-slate-400">Không tìm thấy thông tin user</p>
      </div>
    );
  }

  const isAdmin = user.role?.role_name?.toLowerCase() === "admin";
  const cardClass = "bg-[#1e293b] rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl";

  return (
    <div className="bg-[#0f172a] py-12 px-4 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Header Compact Card */}
        <div className="bg-[#1e293b] rounded-[32px] p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8 border border-slate-700/50 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

          {/* Avatar - Squircle */}
          <div className="shrink-0 relative">
             <Avatar 
                shape="square" 
                size={140} 
                src={user.avatar} 
                icon={<UserOutlined />} 
                className="rounded-[32px] shadow-xl border-4 border-[#0f172a] bg-slate-800"
             />
              {isAdmin && (
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 rounded-full p-2 shadow-lg border-4 border-[#1e293b]">
                    <CrownOutlined className="text-lg block" />
                </div>
              )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left z-10">
             <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">{user.fullname}</h1>
             <p className="text-slate-400 text-lg font-medium mb-4 flex flex-col md:flex-row items-center gap-2 md:gap-3">
                <span className="group-hover:text-blue-400 transition-colors">@{user.username}</span>
                <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                <span className="text-slate-500 text-base">{user.email}</span>
             </p>
             
             {/* Tags */}
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border ${
                     isAdmin ? 'border-red-500/20 text-red-400 bg-red-500/10' : 'border-blue-500/20 text-blue-400 bg-blue-500/10'
                 }`}>
                     {user.role?.role_name || 'Member'}
                 </span>
                 <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border border-emerald-500/20 text-emerald-400 bg-emerald-500/10 flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     Active
                 </span>
             </div>
          </div>

          {/* Action */}
          <div className="shrink-0 z-10 w-full md:w-auto">
             <Button 
                size="large"
                icon={<EditOutlined />}
                className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200 hover:text-white h-12 px-8 rounded-xl font-semibold border shadow-lg transition-all"
                onClick={() => message.info("Chức năng đang phát triển")}
              >
                Chỉnh sửa
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Contact Info */}
          <div className="space-y-6">
            <div className={`${cardClass} p-5`}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3 pb-3 border-b border-slate-700/50">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <MailOutlined />
                </div>
                Thông tin liên hệ
              </h3>
              
              <div className="space-y-1">
                <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/50 transition-colors group cursor-default">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                    <MailOutlined />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-0.5">Email</p>
                    <p className="text-slate-200 font-medium truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/50 transition-colors group cursor-default">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                    <PhoneOutlined />
                  </div>
                  <div>
                     <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-0.5">Số điện thoại</p>
                     <p className="text-slate-200 font-medium">{user.phone || "Chưa cập nhật"}</p>
                  </div>
                </div>
                
                 <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/50 transition-colors group cursor-default">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-purple-500/10 group-hover:text-purple-400 transition-colors">
                    <IdcardOutlined />
                  </div>
                  <div>
                     <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-0.5">User ID</p>
                     <p className="text-slate-200 font-medium font-mono">#{user.user_id}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Stats or Additional Box could go here */}
            <div className={`${cardClass} p-6 bg-gradient-to-br from-[#1e293b] to-[#1e293b] relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <IdcardOutlined style={{ fontSize: '35px', color: 'white' }} />
                </div>
                <h3 className="text-slate-400 text-sm font-semibold uppercase mb-2">Trạng thái tài khoản</h3>
                <p className="text-emerald-400 text-lg font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Đã xác thực
                </p>
            </div>
          </div>

          {/* Right Column: Detailed Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`${cardClass} p-8`}>
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <IdcardOutlined />
                 </div>
                 Thông tin cá nhân
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="group">
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 group-hover:text-blue-400 transition-colors">Họ và tên</p>
                      <p className="text-white text-lg font-medium border-b border-slate-700/50 pb-2">{user.fullname}</p>
                  </div>
                  
                  <div className="group">
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 group-hover:text-blue-400 transition-colors">Username</p>
                      <p className="text-white text-lg font-medium border-b border-slate-700/50 pb-2">@{user.username}</p>
                  </div>

                  <div className="group">
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 group-hover:text-blue-400 transition-colors">Email đăng ký</p>
                      <p className="text-white text-lg font-medium border-b border-slate-700/50 pb-2">{user.email}</p>
                  </div>

                  <div className="group">
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 group-hover:text-blue-400 transition-colors">Vai trò hệ thống</p>
                      <p className="text-white text-lg font-medium border-b border-slate-700/50 pb-2 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                          {user.role?.role_name || "Thành viên"}
                      </p>
                  </div>

                  <div className="group">
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 group-hover:text-blue-400 transition-colors">Ngày tham gia</p>
                      <p className="text-white text-lg font-medium border-b border-slate-700/50 pb-2 flex items-center gap-2">
                          <CalendarOutlined className="text-slate-500" />
                          {new Date(user.created_at).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                         })}
                      </p>
                  </div>
                  
                  <div className="group">
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 group-hover:text-blue-400 transition-colors">Cập nhật lần cuối</p>
                      <p className="text-white text-lg font-medium border-b border-slate-700/50 pb-2 flex items-center gap-2">
                          <CalendarOutlined className="text-slate-500" />
                          {new Date(user.updated_at).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                         })}
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
