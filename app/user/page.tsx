"use client";

import { useState, useEffect } from "react";
import { BookOutlined, FileTextOutlined, UserOutlined, AppstoreOutlined, CloudDownloadOutlined, ArrowRightOutlined, SettingOutlined } from "@ant-design/icons";
import { IoBookOutline } from "react-icons/io5";
import { App, Card } from "antd";
import { useRouter } from "next/navigation";
import UserWelcomeBanner from "@/app/components/user/dashboard/UserWelcomeBanner";
import UserStatisticsCards from "@/app/components/user/dashboard/UserStatisticsCards";
import { getStats, type StatsResponse } from "@/lib/api/stats";

const userDashboardItems = [
  {
    icon: AppstoreOutlined,
    title: "Lớp học",
    description: "Truy cập danh sách lớp học",
    gradient: "from-green-500 to-green-600",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    path: "/user/classes",
  },
  {
    icon: IoBookOutline,
    title: "Khóa học của tôi",
    description: "Xem các khóa học đã đăng ký",
    gradient: "from-amber-500 to-amber-600",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    path: "/user/courses",
    isComingSoon: true,
  },
  {
    icon: FileTextOutlined,
    title: "Tài liệu hệ thống",
    description: "Tra cứu tài liệu học tập",
    gradient: "from-indigo-500 to-indigo-600",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    path: "/user/documents",
  },
  {
    icon: SettingOutlined,
    title: "Cài đặt",
    description: "Quản lý thông tin cá nhân",
    gradient: "from-gray-500 to-gray-600",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
    path: "/user/settings",
  },
];

function QuickActionsGrid({ items }: { items: any[] }) {
  const router = useRouter();
  const { message } = App.useApp();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card
            key={index}
            hoverable
            onClick={() => {
              if (item.isComingSoon) {
                message.info("Tính năng đang phát triển");
                return;
              }
              router.push(item.path);
            }}
            className="group cursor-pointer border border-slate-200 dark:border-slate-700 shadow-none dark:shadow-sm transition-shadow duration-300 overflow-hidden bg-white dark:bg-gray-800"
            styles={{
              body: { padding: 0 },
            }}
          >
            <div className={`bg-linear-to-br ${item.gradient} p-6 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div className="relative z-10">
                <div
                  className={`${item.iconBg} dark:bg-white/10 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="text-black dark:text-white">
                    <Icon className={`text-3xl ${item.iconColor} dark:text-white`} />
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-blue-100 text-sm">{item.description}</p>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <span className="text-sm font-medium">Truy cập ngay</span>
                <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}



export default function UserDashboard() {
  const { message } = App.useApp();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getStats();
        setStats(data);
      } catch (error: any) {
        message.error(error?.message || "Không thể tải thống kê");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [message]);

  const userStats = [
    {
      label: "Tài liệu",
      value: stats?.documents?.toString() || "0",
      icon: FileTextOutlined,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/30",
    },
    {
      label: "Người dùng",
      value: stats?.users?.toString() || "0",
      icon: UserOutlined,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-50 dark:bg-cyan-900/30",
    },
    {
      label: "Tin tức",
      value: stats?.news?.toString() || "0",
      icon: AppstoreOutlined,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/30",
    },
    {
      label: "Sự kiện",
      value: stats?.events?.toString() || "0",
      icon: CloudDownloadOutlined,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <UserWelcomeBanner />

      {/* Statistics Cards */}
      <UserStatisticsCards stats={userStats} />

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Truy cập nhanh</h2>
        <QuickActionsGrid items={userDashboardItems} />
      </div>
    </div>
  );
}

