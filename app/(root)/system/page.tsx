"use client";

import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, WarningOutlined, WifiOutlined } from "@ant-design/icons";
import { ConfigProvider, theme as antTheme, Tooltip } from "antd";
import { useTheme } from "@/app/context/ThemeContext";
import { useEffect, useState } from "react";

interface UpdatingService {
  name: string;
  status: "operational" | "degraded" | "outage" | "maintenance";
  description: string;
  message?: string;
  latency: number;
  uptime: number;
  history: number[]; // Array of 20 numbers derived for visual history
}

export default function SystemStatusPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Mock data generator helper
  const generateHistory = () => Array.from({ length: 20 }, () => Math.random() > 0.9 ? 0 : 1);

  const [services, setServices] = useState<UpdatingService[]>([
    { name: "Website & Giao diện", status: "operational", description: "Truy cập trang web và điều hướng", latency: 28, uptime: 99.99, history: generateHistory() },
    { name: "API Server", status: "operational", description: "Xử lý dữ liệu và yêu cầu người dùng", latency: 45, uptime: 99.95, history: generateHistory() },
    { name: "Cơ sở dữ liệu", status: "operational", description: "Lưu trữ và truy xuất thông tin", latency: 15, uptime: 99.98, history: generateHistory() },
    { name: "Hệ thống Video", status: "degraded", description: "Phát và tải video bài giảng", message: "Đang bảo trì server CDN Châu Á", latency: 124, uptime: 98.45, history: generateHistory() },
    { name: "Cổng thanh toán", status: "operational", description: "Xử lý giao dịch Momo, VNPAY, Thẻ", latency: 65, uptime: 99.90, history: generateHistory() },
    { name: "Hệ thống Email", status: "operational", description: "Gửi email xác nhận và thông báo", latency: 89, uptime: 99.85, history: generateHistory() },
    { name: "Socket Real-time", status: "operational", description: "Chat và thông báo thời gian thực", latency: 32, uptime: 99.96, history: generateHistory() },
    { name: "AI Services", status: "maintenance", description: "Gợi ý khóa học và Chatbot", message: "Đang nâng cấp model", latency: 0, uptime: 85.00, history: generateHistory() },
  ]);

  // Live data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prevServices => prevServices.map(service => {
        // Skip updates for maintenance items mostly
        if (service.status === 'maintenance') return service;

        // Randomize latency
        const latencyChange = Math.floor(Math.random() * 10) - 5;
        let newLatency = Math.max(5, service.latency + latencyChange);

        // Randomize uptime slightly
        let newUptime = service.uptime;
        if (Math.random() > 0.8) {
          newUptime = parseFloat((service.uptime + (Math.random() * 0.01 - 0.005)).toFixed(2));
          if (newUptime > 100) newUptime = 100;
        }

        // Shift history bar (simulate moving time window) - 20% chance to shift
        let newHistory = service.history;
        if (Math.random() > 0.8) {
          newHistory = [...service.history.slice(1), Math.random() > 0.95 ? 0 : 1];
        }

        return {
          ...service,
          latency: newLatency,
          uptime: newUptime,
          history: newHistory
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "degraded": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "outage": return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      case "maintenance": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      default: return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational": return <CheckCircleOutlined />;
      case "degraded": return <WarningOutlined />;
      case "outage": return <CloseCircleOutlined />;
      case "maintenance": return <ClockCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "operational": return "Hoạt động tốt";
      case "degraded": return "Hiệu năng giảm";
      case "outage": return "Ngừng hoạt động";
      case "maintenance": return "Đang bảo trì";
      default: return "Không xác định";
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
      }}
    >
      <main className="h-full bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 pt-24 pb-20 px-4">

        {/* Header Section */}
        <div className="container mx-auto mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-6 animate-pulse">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Hệ thống đang hoạt động ổn định
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-4">
            Trạng thái hệ thống
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Theo dõi thời gian thực trạng thái hoạt động của các dịch vụ và thành phần trong hệ thống Thư Viện Số.
          </p>
        </div>

        <div className="container mx-auto grid gap-12">

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200">{service.name}</h3>
                  <Tooltip title={getStatusLabel(service.status)}>
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full text-lg ${getStatusColor(service.status)} transition-all duration-500`}>
                      {getStatusIcon(service.status)}
                    </span>
                  </Tooltip>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 min-h-[40px] line-clamp-2">{service.description}</p>

                {/* Status Message or Live Metrics - DYNAMIC PART */}
                <div className="min-h-[28px] mb-3">
                  {service.message ? (
                    <div className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 inline-block">
                      {service.message}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <WifiOutlined className={service.latency > 100 ? "text-amber-500" : "text-emerald-500"} />
                        <span>{service.latency}ms</span>
                      </div>
                      <div className="w-px h-3 bg-slate-300 dark:bg-slate-700"></div>
                      <div>{service.uptime}% uptime</div>
                    </div>
                  )}
                </div>

                {/* Dynamic Uptime Bar - DYNAMIC PART */}
                <div className="flex gap-[2px] mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  {service.history.map((status, i) => (
                    <Tooltip key={i} title={status === 1 ? "Hoạt động tốt" : "Có gián đoạn"}>
                      <div
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${status === 1
                            ? (service.status === 'degraded' ? 'bg-amber-500' : 'bg-emerald-500')
                            : 'bg-rose-500'
                          }`}
                      ></div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </ConfigProvider>
  );
}
