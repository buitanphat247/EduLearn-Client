"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { AppstoreOutlined, UserOutlined, ArrowRightOutlined, CloudDownloadOutlined, FileTextOutlined, SettingOutlined, ReadOutlined } from "@ant-design/icons";
import { IoBookOutline } from "react-icons/io5";
import { Card, App } from "antd";
import { useRouter } from "next/navigation";
import { getStats, type StatsResponse } from "@/lib/api/stats";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// Dynamic import for CountUp - only load when needed (below the fold)
const CountUp = dynamic(() => import("react-countup"), {
  ssr: false, // CountUp is animation library, not needed for SSR
});

// Type definitions
interface StatCard {
  label: string;
  value: string;
  icon: ComponentType<any>;
  color: string;
  bgColor: string;
  numericValue?: number;
}

interface QuickActionItem {
  icon: ComponentType<any>;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  path: string;
  isComingSoon?: boolean;
}

const dashboardItems: QuickActionItem[] = [
  {
    icon: ReadOutlined,
    title: "Quản lý lớp học",
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
    icon: IoBookOutline,
    title: "Quản lý khóa học",
    description: "Quản lý các khóa học trong hệ thống",
    gradient: "from-amber-500 to-amber-600",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    path: "/admin/courses",
    isComingSoon: true,
  },
  {
    icon: FileTextOutlined,
    title: "Tài liệu hệ thống",
    description: "Quản lý tài liệu được crawl từ nguồn ngoài",
    gradient: "from-indigo-500 to-indigo-600",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    path: "/admin/document-crawl",
  },
  {
    icon: SettingOutlined,
    title: "Cài đặt",
    description: "Cấu hình hệ thống",
    gradient: "from-gray-500 to-gray-600",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
    path: "/admin/settings",
  },
];

// Constants
const MORNING_HOUR = 12;
const EVENING_HOUR = 18;

function WelcomeBanner() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < MORNING_HOUR) return "Chào buổi sáng";
    if (hour < EVENING_HOUR) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-none dark:shadow-sm transition-shadow duration-300">
      <h1 className="text-3xl font-bold mb-2">{getGreeting()}, Admin Teacher!</h1>
      <p className="text-blue-100 text-lg">Chào mừng bạn quay trở lại. Dưới đây là tổng quan về hệ thống của bạn.</p>
    </div>
  );
}

function StatisticsCards({ stats }: { stats: StatCard[] }) {
  const statsCards = useMemo(() =>
    stats.map((stat) => ({
      ...stat,
      numericValue: parseInt(stat.value.replace(/,/g, "")) || 0,
    })),
    [stats]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {statsCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="border border-slate-200 dark:border-slate-700 shadow-none dark:shadow-sm transition-all duration-300 cursor-default bg-white dark:bg-gray-800"
            styles={{
              body: { padding: "24px" },
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color} dark:brightness-110`}>
                  <Suspense fallback={<span>{stat.value}</span>}>
                    <CountUp start={0} end={stat.numericValue} duration={2} separator="," decimals={0} />
                  </Suspense>
                </p>
              </div>
              <div className={`${stat.bgColor} p-4 rounded-xl`}>
                <Icon className={`text-2xl ${stat.color} dark:brightness-110`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function QuickActionsGrid({ items }: { items: QuickActionItem[] }) {
  const router = useRouter();
  const { message } = App.useApp();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.path}
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

export default function AdminDashboard() {
  const { message } = App.useApp();
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const data = await getStats();
        if (isMounted) {
          setStats(data);
        }
      } catch (error: any) {
        if (isMounted) {
          message.error(error?.message || "Không thể tải thống kê");
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
    <div className="space-y-5">
      {/* Welcome Section */}
      <WelcomeBanner />

      {/* Statistics Cards */}
      <StatisticsCards stats={statsCards} />

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Truy cập nhanh</h2>
        <QuickActionsGrid items={dashboardItems} />
      </div>
    </div>
  );
}
