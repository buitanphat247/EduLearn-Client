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
    title: "Chi phí tối ưu",
    description: "Chỉ 35k/tháng cho tất cả tính năng premium. Học không giới hạn 4 ngôn ngữ: Anh, Trung, Nhật, Hàn.",
  },
  {
    icon: <BrainIcon />,
    title: "Học tập thông minh",
    description: "AI phân tích lộ trình học và tạo bài tập cá nhân hóa. Ghi nhớ từ vựng lâu hơn với Flashcards.",
  },
  {
    icon: <WriteIcon />,
    title: "Luyện viết cùng AI",
    description: "Dịch và sửa lỗi ngữ pháp tức thì. Nhận phản hồi chi tiết từ trợ lý ảo để cải thiện kỹ năng viết.",
  },
  {
    icon: <HeadphoneIcon />,
    title: "Luyện nghe & Tin tức",
    description: "Kho Audio đa dạng chủ đề kèm transcript. Luyện kỹ năng Shadowing chuẩn người bản xứ.",
  },
];

export default function Features() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#0f172a]">
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-500/10 rounded-full">
            Tại sao chọn chúng tôi?
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Giải pháp học tập toàn diện</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Kết hợp công nghệ AI tiên tiến và phương pháp giáo dục hiện đại giúp bạn chinh phục mục tiêu nhanh chóng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#1e293b]/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 hover:bg-[#1e293b] transition-all duration-300 group hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/20"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner border border-white/5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
