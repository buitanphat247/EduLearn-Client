"use client";

import {
  ReadOutlined,
  BellOutlined,
  UserOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Card } from "antd";
import { useRouter } from "next/navigation";

const dashboardItems = [
  {
    icon: ReadOutlined,
    title: "Quản lý nguồn tài liệu",
    description: "Quản lý và phân phối tài liệu học tập",
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    path: "/super-admin/documents",
  },
  {
    icon: UserOutlined,
    title: "Quản lý tài khoản",
    description: "Quản lý toàn bộ tài khoản người dùng trong hệ thống",
    gradient: "from-green-500 to-green-600",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    path: "/super-admin/accounts",
  },
  {
    icon: BellOutlined,
    title: "Quản lý toàn bộ tin tức",
    description: "Quản lý và kiểm duyệt tất cả tin tức trên hệ thống",
    gradient: "from-purple-500 to-purple-600",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    path: "/super-admin/news",
  },
  {
    icon: FileTextOutlined,
    title: "Quản lý toàn bộ bài viết",
    description: "Quản lý và kiểm duyệt tất cả bài viết trên hệ thống",
    gradient: "from-orange-500 to-orange-600",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    path: "/super-admin/posts",
  },
  {
    icon: CalendarOutlined,
    title: "Quản lý toàn bộ sự kiện",
    description: "Quản lý và tổ chức tất cả sự kiện trong hệ thống",
    gradient: "from-pink-500 to-pink-600",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    path: "/super-admin/events",
  },
  {
    icon: DatabaseOutlined,
    title: "Quản lý toàn bộ",
    description: "Quản lý tổng quan toàn bộ hệ thống và dữ liệu",
    gradient: "from-indigo-500 to-indigo-600",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    path: "/super-admin/all",
  },
];

const stats = [
  {
    label: "Tài liệu",
    value: "128",
    icon: ReadOutlined,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    label: "Tài khoản",
    value: "342",
    icon: UserOutlined,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    label: "Tin tức",
    value: "45",
    icon: BellOutlined,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    label: "Bài viết",
    value: "89",
    icon: FileTextOutlined,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

function WelcomeBanner() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <h1 className="text-3xl font-bold mb-2">{getGreeting()}, Super Admin!</h1>
      <p className="text-blue-100 text-lg">
        Chào mừng bạn quay trở lại. Dưới đây là tổng quan về hệ thống của bạn.
      </p>
    </div>
  );
}

function StatisticsCards({ stats }: { stats: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card
            key={index}
            className="shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-4 rounded-lg`}>
                <IconComponent className={`${stat.color} text-2xl`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function SuperAdminDashboard() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <WelcomeBanner />

      <StatisticsCards stats={stats} />

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Chức năng quản lý</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card
                key={index}
                hoverable
                onClick={() => router.push(item.path)}
                className="group cursor-pointer border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                styles={{
                  body: { padding: 0 },
                }}
              >
                <div
                  className={`bg-linear-to-br ${item.gradient} p-6 text-white relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative z-10">
                    <div
                      className={`${item.iconBg} w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="text-black">
                        <IconComponent className={`text-3xl ${item.iconColor}`} />
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
    </div>
  );
}

