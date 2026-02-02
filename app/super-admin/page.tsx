"use client";

import {
  BellOutlined,
  UserOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  CloudDownloadOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Card } from "antd";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { getStats } from "@/lib/api/stats";
import { App } from "antd";

// Dynamic import for CountUp - only load when needed (below the fold)
const CountUp = dynamic(() => import("react-countup"), {
  ssr: false, // CountUp is animation library, not needed for SSR
});

const dashboardItems = [
  {
    icon: CloudDownloadOutlined,
    title: "Tài liệu Crawl",
    description: "Quản lý tài liệu được crawl từ các nền tảng bên ngoài",
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    path: "/super-admin/documents-crawl",
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
  {
    icon: SafetyCertificateOutlined,
    title: "Phân quyền hệ thống",
    description: "Quản lý vai trò và quyền hạn truy cập của các thành viên",
    gradient: "from-rose-500 to-rose-600",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    path: "/super-admin/permissions",
  },
];

// Stats sẽ được fetch từ API

// ... (previous imports)

function WelcomeBanner() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
      <h1 className="text-3xl font-bold mb-2">{getGreeting()}, Super Admin!</h1>
      <p className="text-blue-100 text-lg">Chào mừng bạn quay trở lại. Dưới đây là tổng quan về hệ thống của bạn.</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: IconComponent,
  color,
  bgColor,
  darkBgColor,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
  bgColor: string;
  darkBgColor?: string;
}) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            <Suspense fallback={<span>{value.toLocaleString()}</span>}>
              <CountUp start={0} end={value} duration={2} separator="," decimals={0} />
            </Suspense>
          </p>
        </div>
        <div className={`${bgColor} ${darkBgColor || ""} p-4 rounded-lg`}>
          <IconComponent className={`${color} text-2xl`} />
        </div>
      </div>
    </Card>
  );
}

function StatisticsCards({ stats }: { stats: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { message } = App.useApp();
  const [stats, setStats] = useState({
    documents: 0,
    users: 0,
    news: 0,
    events: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getStats();
        if (isMounted) {
          setStats(data);
        }
      } catch (error: any) {
        if (isMounted) {
          message.error(error?.message || "Không thể tải thống kê");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []); // Remove message dependency

  const statsCards = [
    {
      label: "Tài liệu Crawl",
      value: stats.documents,
      icon: CloudDownloadOutlined,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50",
      darkBgColor: "dark:bg-blue-900/20",
    },
    {
      label: "Tài khoản",
      value: stats.users,
      icon: UserOutlined,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50",
      darkBgColor: "dark:bg-green-900/20",
    },
    {
      label: "Tin tức",
      value: stats.news,
      icon: BellOutlined,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50",
      darkBgColor: "dark:bg-purple-900/20",
    },
    {
      label: "Sự kiện",
      value: stats.events,
      icon: CalendarOutlined,
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-50",
      darkBgColor: "dark:bg-pink-900/20",
    },
  ];

  return (
    <div className="space-y-6">
      <WelcomeBanner />

      <StatisticsCards stats={statsCards} />

      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Chức năng quản lý</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => {
            const IconComponent = item.icon;
            // Map light icon bg to a suitable dark one
            // We can infer dark classes or add them to dashboardItems.
            // For simplicity, let's just make the card body dark.

            return (
              <Card
                key={index}
                hoverable
                onClick={() => router.push(item.path)}
                className="group cursor-pointer border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300 overflow-hidden dark:bg-slate-800"
                styles={{
                  body: { padding: 0 },
                }}
              >
                <div className={`bg-linear-to-br ${item.gradient} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative z-10">
                    <div
                      className={`${item.iconBg} dark:bg-black/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="text-black dark:text-white">
                        <IconComponent className={`text-3xl ${item.iconColor} dark:text-white`} />
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-blue-100 text-sm">{item.description}</p>
                  </div>
                </div>
                <div className="p-6 bg-white dark:bg-slate-800 transition-colors duration-300">
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
