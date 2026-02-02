"use client";

import React from "react";
import { Button } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  return (
    <section className="relative overflow-hidden bg-[#fafbfc] dark:bg-[#0f172a] pt-20 pb-32 transition-all duration-500 ease-in-out">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-medium text-sm animate-fade-in-up" suppressHydrationWarning>
            <span aria-hidden="true">✨</span> Nền tảng giáo dục số hàng đầu
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-slate-900 via-blue-800 to-blue-600 dark:from-white dark:via-blue-100 dark:to-blue-200 mb-8 leading-tight tracking-tight">
            Khám phá tri thức <br />
            <span className="text-blue-600 dark:text-blue-500">không giới hạn</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Truy cập hàng ngàn tài liệu, khóa học và công cụ hỗ trợ học tập thông minh.
            Đồng hành cùng bạn trên con đường chinh phục tri thức.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/news" 
              prefetch={false}
              onMouseEnter={() => router.prefetch("/news")}
            >
              <button className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-600/25 transition-all hover:scale-105 active:scale-95">
                Bắt đầu ngay
              </button>
            </Link>
            <button className="h-14 px-8 rounded-full bg-white dark:bg-[#1e293b] hover:bg-slate-50 dark:hover:bg-[#334155] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-lg transition-all hover:scale-105 active:scale-95">
              Tìm hiểu thêm
            </button>
          </div>

          {/* Floating UI Elements Mockup */}
          <div className="mt-20 relative animate-float">
            <div className="relative mx-auto rounded-xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-700/50 dark:to-slate-800/50 p-2 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-4xl">
              <div className="rounded-lg overflow-hidden bg-slate-100 dark:bg-[#0f172a] aspect-[16/9] flex items-center justify-center relative group">
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-10 dark:opacity-20"
                  style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                </div>

                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Thư Viện Số</h3>
                  <p className="text-slate-600 dark:text-slate-400">Hàng triệu tài liệu đang chờ bạn khám phá</p>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-10 -left-10 p-4 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl hidden md:block animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-green-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <div className="text-slate-900 dark:text-white font-bold">Đã cập nhật</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Vừa xong</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -right-5 p-4 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl hidden md:block animate-bounce-slow delay-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <div>
                  <div className="text-slate-900 dark:text-white font-bold">10k+ Tài liệu</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Kho sách khổng lồ</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
