"use client";

import React from "react";
import {
  ReadOutlined,
  AudioOutlined,
  EditOutlined,
  LineChartOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  AimOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  SyncOutlined,
} from "@ant-design/icons";

export default function Integrations() {
  const row1Features = [
    { name: "Học từ vựng thông minh", icon: <ReadOutlined /> },
    { name: "Luyện viết cùng AI", icon: <EditOutlined /> },
    { name: "Luyện nghe tiếng Anh", icon: <AudioOutlined /> },
    { name: "Phân tích tiến độ học tập", icon: <LineChartOutlined /> },
    { name: "Sửa lỗi ngữ pháp tức thì", icon: <CheckCircleOutlined /> },
    { name: "Flashcards thông minh", icon: <ThunderboltOutlined /> },
    { name: "Đánh giá năng lực", icon: <TrophyOutlined /> },
  ];

  const row2Features = [
    { name: "Spaced Repetition (SRS)", icon: <SyncOutlined /> },
    { name: "Phát âm chuẩn bản xứ", icon: <GlobalOutlined /> },
    { name: "Trợ lý ảo 24/7", icon: <RobotOutlined /> },
    { name: "Gợi ý lộ trình cá nhân hóa", icon: <AimOutlined /> },
    { name: "Thống kê thời gian thực", icon: <ClockCircleOutlined /> },
    { name: "Thi thử đa dạng", icon: <ReadOutlined /> },
    { name: "Bám sát mục tiêu", icon: <AimOutlined /> },
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-[#0f172a] border-y border-slate-200 dark:border-slate-800 transition-colors duration-300 overflow-hidden relative">
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee-left {
          animation: marquee-left 40s linear infinite;
        }
        .animate-marquee-right {
          animation: marquee-right 40s linear infinite;
        }
        .pause-on-hover:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-[1280px] mb-16 relative z-10">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Hệ sinh thái học tập
          </span>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2">
            Giải pháp toàn diện cho mọi mục tiêu
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto text-lg">
            Khám phá hàng loạt tính năng nổi bật được chúng tôi tối ưu nhằm mang lại trải nghiệm học tập tốt nhất.
          </p>
        </div>
      </div>

      {/* Marquee Row 1 (Left to Right Illusion by moving Left) */}
      <div className="relative w-full flex overflow-hidden mb-6 group">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent dark:from-[#0f172a] z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent dark:from-[#0f172a] z-10 pointer-events-none"></div>

        <div className="flex animate-marquee-left pause-on-hover min-w-max">
          {[...row1Features, ...row1Features, ...row1Features].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-white dark:bg-[#1e293b] px-6 py-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 mx-3 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 group/item"
            >
              <div className="text-2xl text-blue-600 dark:text-blue-400 group-hover/item:scale-110 transition-transform">
                {feature.icon}
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap text-lg">
                {feature.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Row 2 (Right to Left Illusion by moving Right) */}
      <div className="relative w-full flex overflow-hidden group">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent dark:from-[#0f172a] z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent dark:from-[#0f172a] z-10 pointer-events-none"></div>

        <div className="flex animate-marquee-right pause-on-hover min-w-max">
          {[...row2Features, ...row2Features, ...row2Features].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-white dark:bg-[#1e293b] px-6 py-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 mx-3 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600 group/item"
            >
              <div className="text-2xl text-purple-600 dark:text-purple-400 group-hover/item:scale-110 transition-transform">
                {feature.icon}
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap text-lg">
                {feature.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
