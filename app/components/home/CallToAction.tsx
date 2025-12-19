"use client";

import React from "react";

export default function CallToAction() {
  return (
    <section className="py-24 bg-[#0f172a] relative border-t border-slate-800/50">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-green-400 uppercase bg-green-500/10 rounded-full border border-green-500/20">
            Bắt đầu hành trình ngay
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
            Đừng để sự nghiệp của bạn <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">dậm chân tại chỗ</span>
          </h2>
          
          <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
            Gia nhập cộng đồng hơn 10,000+ người học và nhận lộ trình phát triển bản thân miễn phí ngay hôm nay.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto relative group">
            <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full group-hover:bg-blue-600/30 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            
            <input 
              type="text" 
              placeholder="Nhập email của bạn..." 
              className="w-full h-14 px-6 rounded-full bg-[#1e293b] border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500 relative z-10"
            />
            
            <button className="w-full sm:w-auto h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl relative z-10 whitespace-nowrap flex items-center justify-center gap-2">
              <span>Đăng ký</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-slate-500 text-sm font-medium">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span>Miễn phí 7 ngày đầu</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span>Hủy bất kỳ lúc nào</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
