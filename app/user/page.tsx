"use client";

import { useState, useEffect } from "react";
import { BookOutlined, FileTextOutlined, UserOutlined, AppstoreOutlined } from "@ant-design/icons";
import { App } from "antd";
import UserWelcomeBanner from "@/app/components/user/dashboard/UserWelcomeBanner";
import UserStatisticsCards from "@/app/components/user/dashboard/UserStatisticsCards";
import ProgressCard from "@/app/components/user/dashboard/ProgressCard";
import UpcomingClassesList from "@/app/components/user/classes/UpcomingClassesList";
import { getStats, type StatsResponse } from "@/lib/api/stats";

const upcomingClasses = [
  {
    id: "1",
    name: "Toán học",
    time: "08:00 - 08:45",
    teacher: "Nguyễn Văn A",
    room: "Phòng 101",
  },
  {
    id: "2",
    name: "Ngữ văn",
    time: "09:00 - 09:45",
    teacher: "Trần Thị B",
    room: "Phòng 102",
  },
  {
    id: "3",
    name: "Vật lý",
    time: "10:00 - 10:45",
    teacher: "Lê Văn C",
    room: "Phòng 103",
  },
];

const progressItems = [
  {
    subject: "Toán học",
    percent: 85,
    color: { "0%": "#10b981", "100%": "#34d399" },
    textColor: "text-green-600",
  },
  {
    subject: "Ngữ văn",
    percent: 72,
    color: { "0%": "#3b82f6", "100%": "#60a5fa" },
    textColor: "text-blue-600",
  },
  {
    subject: "Vật lý",
    percent: 68,
    color: { "0%": "#f97316", "100%": "#fb923c" },
    textColor: "text-orange-600",
  },
  {
    subject: "Hóa học",
    percent: 90,
    color: { "0%": "#a855f7", "100%": "#c084fc" },
    textColor: "text-purple-600",
  },
];


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
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Người dùng",
      value: stats?.users?.toString() || "0",
      icon: UserOutlined,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      label: "Tin tức",
      value: stats?.news?.toString() || "0",
      icon: AppstoreOutlined,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Sự kiện",
      value: stats?.events?.toString() || "0",
      icon: BookOutlined,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <UserWelcomeBanner />

      {/* Statistics Cards */}
      <UserStatisticsCards stats={userStats} />

      {/* Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressCard items={progressItems} />
      </div>

      {/* Upcoming Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingClassesList classes={upcomingClasses} />
      </div>
    </div>
  );
}

