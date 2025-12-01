"use client";

import { Card } from "antd";
import { useRouter } from "next/navigation";
import {
  FileTextOutlined,
  AppstoreOutlined,
  ReadOutlined,
  BellOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const dashboardItems = [
  {
    icon: FileTextOutlined,
    title: "Bài tập",
    description: "Quản lý và tạo bài tập cho học sinh",
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    path: "/admin/exercises",
  },
  {
    icon: BellOutlined,
    title: "Quản lý tin tức",
    description: "Đăng và chỉnh sửa tin tức",
    gradient: "from-purple-500 to-purple-600",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    path: "/admin/news",
  },
  {
    icon: AppstoreOutlined,
    title: "Quản lý lớp",
    description: "Quản lý danh sách lớp học",
    gradient: "from-green-500 to-green-600",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    path: "/admin/classes",
  },
  {
    icon: UserOutlined,
    title: "Quản lý học sinh",
    description: "Quản lý thông tin và danh sách học sinh",
    gradient: "from-cyan-500 to-cyan-600",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    path: "/admin/students",
  },
  {
    icon: MessageOutlined,
    title: "Chat / Hỏi đáp",
    description: "Quản lý chat và hỏi đáp trong lớp học",
    gradient: "from-pink-500 to-pink-600",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    path: "/admin/class-chat",
  },
  {
    icon: ReadOutlined,
    title: "Kho nội dung",
    description: "Quản lý tài liệu và nội dung học tập",
    gradient: "from-indigo-500 to-indigo-600",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    path: "/admin/content",
  },
];

// Mock statistics data - có thể thay thế bằng dữ liệu thực từ API
const stats = [
  {
    label: "Tổng bài tập",
    value: "24",
    icon: FileTextOutlined,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    label: "Lớp học",
    value: "12",
    icon: AppstoreOutlined,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    label: "Học sinh",
    value: "156",
    icon: UserOutlined,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    label: "Tin tức",
    value: "15",
    icon: BellOutlined,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

export default function AdminDashboard() {
  const router = useRouter();

  // Lấy giờ hiện tại để chào mừng
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white border border-gray-200 hover:shadow-lg transition-shadow duration-300">
        <h1 className="text-3xl font-bold mb-2">{getGreeting()}, Admin Teacher!</h1>
        <p className="text-blue-100 text-lg">Chào mừng bạn quay trở lại. Dưới đây là tổng quan về hệ thống của bạn.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="border border-gray-200 hover:shadow-lg transition-all duration-300"
              styles={{
                body: { padding: "24px" },
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-4 rounded-xl`}>
                  <Icon className={`text-2xl ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Truy cập nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                hoverable
                onClick={() => router.push(item.path)}
                className="group cursor-pointer border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                styles={{
                  body: { padding: 0 },
                }}
              >
                <div className={`bg-linear-to-br ${item.gradient} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative z-10">
                    <div
                      className={`${item.iconBg} w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="text-black">
                        <Icon className={`text-3xl ${item.iconColor}`} />
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-blue-100 text-sm">{item.description}</p>
                  </div>
                </div>
                <div className="p-6 bg-white">
                  <div className="flex items-center justify-between text-gray-600 group-hover:text-blue-600 transition-colors">
                    <span className="text-sm font-medium">Truy cập ngay</span>
                    <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Section (Optional) */}
      <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Hoạt động gần đây</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-green-500">
              <CheckCircleOutlined className="text-xl" />
            </span>
            <div className="flex-1">
              <p className="text-gray-800 font-medium">Đã tạo bài tập mới</p>
              <p className="text-gray-500 text-sm">2 giờ trước</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-blue-500">
              <ClockCircleOutlined className="text-blue-500 text-xl" />
            </span>
            <div className="flex-1">
              <p className="text-gray-800 font-medium">Đã cập nhật tin tức</p>
              <p className="text-gray-500 text-sm">5 giờ trước</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
