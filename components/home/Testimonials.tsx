"use client";

import React from "react";
import { Avatar } from "antd";

const philosophies = [
  {
    id: 1,
    title: "Sự Kiên Trì",
    subtitle: "Consistency",
    content: "Hành trình vạn dặm khởi đầu từ một bước chân. Đừng lo lắng về việc tiến chậm, hãy chỉ lo lắng về việc đứng yên.",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      </svg>
    ),
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "Sự Tận Tâm",
    subtitle: "Dedication",
    content: "Học tập không phải là lấp đầy một cái thùng, mà là thắp sáng một ngọn lửa đam mê mãnh liệt bên trong bạn.",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.011 7.5 16.011 11c0 .331-.035.662-.111.986.324.014.653.031.986.031 3.5 0 6.011-2.011 9-5.014-2 2.486-5 2.986-7 2.986z" />
      </svg>
    ),
    color: "from-orange-500 to-red-500",
  },
  {
    id: 3,
    title: "Sự Ứng Dụng",
    subtitle: "Application",
    content: "Biết thôi chưa đủ, chúng ta phải vận dụng. Muốn thôi chưa đủ, chúng ta phải dũng cảm hành động.",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: "from-purple-500 to-indigo-500",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-[#0f172a] relative overflow-hidden transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-blue-500/20 to-transparent"></div>
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#3b82f6 1.5px, transparent 1.5px)', backgroundSize: '48px 48px' }}>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] text-blue-600 dark:text-blue-400 uppercase bg-blue-500/10 dark:bg-blue-500/5 rounded-full border border-blue-500/20">
            Triết lý & Động lực
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            Khai phá tiềm năng <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">vô hạn</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Kiến thức không tự nhiên mà có, nó là kết quả của sự nỗ lực bền bỉ và niềm đam mê khám phá không ngừng nghỉ mỗi ngày.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {philosophies.map((item) => (
            <div key={item.id} className="group bg-white dark:bg-[#1e293b] rounded-[2rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-3 relative overflow-hidden">
              {/* Decorative Gradient Blob */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 bg-linear-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-500`}></div>

              <div className={`w-16 h-16 mb-8 rounded-2xl bg-linear-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                {React.cloneElement(item.icon as any, { className: "w-8 h-8" })}
              </div>

              <div className="mb-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 dark:text-slate-500">{item.subtitle}</span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium transition-colors group-hover:text-slate-900 dark:group-hover:text-slate-200">
                {item.content}
              </p>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full bg-linear-to-br ${item.color} opacity-30`}></div>
                  ))}
                </div>
                <svg className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
