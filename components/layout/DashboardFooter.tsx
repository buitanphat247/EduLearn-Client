"use client";

import { CustomerServiceOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

export default function DashboardFooter() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <footer className="bg-gray-800 h-12 flex items-center justify-between px-6 text-white">
      <div className="flex items-center gap-4">
        {/* System tray icons có thể thêm sau */}
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-colors">
          <CustomerServiceOutlined className="text-lg" />
          <span className="text-sm font-medium">Hỗ trợ</span>
        </button>
        <span className="text-sm font-mono">
          {mounted ? formatTime(currentTime) : ""}
        </span>
      </div>
    </footer>
  );
}
