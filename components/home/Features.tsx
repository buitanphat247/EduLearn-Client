"use client";

import React from "react";

const MoneyIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BrainIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const WriteIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const HeadphoneIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
);

const features = [
  {
    icon: <MoneyIcon />,
    title: "Tối ưu hóa thời gian",
    description: "Hệ thống tự động sắp xếp lịch học và nhắc nhở ôn tập, giúp bạn theo dõi tiến độ dễ dàng mà không tốn công sức thiết lập.",
  },
  {
    icon: <BrainIcon />,
    title: "Cá nhân hóa lộ trình",
    description: "Thuật toán liên tục đánh giá năng lực và tự động điều chỉnh bài học cho phù hợp với tốc độ tiếp thu của riêng từng học viên.",
  },
  {
    icon: <WriteIcon />,
    title: "Kiểm tra năng lực chuẩn xác",
    description: "Hệ thống kho đề thi đa dạng, tự động mô phỏng kỳ thi thật và chấm điểm chi tiết giúp bạn tự tin đạt mục tiêu.",
  },
  {
    icon: <HeadphoneIcon />,
    title: "Học mọi lúc mọi nơi",
    description: "Đồng bộ hóa dữ liệu tức thì trên đa nền tảng. Dễ dàng tiếp tục bài học trên cả điện thoại, máy tính bảng hoặc trên web.",
  },
];

export default function Features() {
  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-[#0f172a] transition-colors duration-300">
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-500/10 rounded-full">
            Tại sao chọn chúng tôi?
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Giải pháp học tập toàn diện</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Kết hợp công nghệ AI tiên tiến và phương pháp giáo dục hiện đại giúp bạn chinh phục mục tiêu nhanh chóng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#1e293b]/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-800/50 hover:bg-white dark:hover:bg-[#1e293b]/80 transition-all duration-500 ease-out group hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-500/5 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 transition-all duration-500 ease-out group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] border border-blue-100/50 dark:border-blue-500/10">
                <div className="transition-transform duration-500 ease-out group-hover:-translate-y-0.5">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors duration-500">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-colors duration-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
