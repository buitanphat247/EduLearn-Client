"use client";

import React, { useEffect, useState, useRef } from "react";

import CountUp from "react-countup";

const stats = [
  {
    id: 1,
    endValue: 60,
    suffix: "K+",
    decimals: 0,
    label: "Từ vựng thông minh",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: 2,
    endValue: 10,
    suffix: "K+",
    decimals: 0,
    label: "Bài luyện nghe",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    ),
  },
  {
    id: 3,
    endValue: 1,
    suffix: "K+",
    decimals: 0,
    label: "Bài tập luyện viết",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    id: 4,
    endValue: 16,
    suffix: "K+",
    decimals: 0,
    label: "Tài liệu đa dạng",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
];

export default function Stats() {
  return (
    <section className="py-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] relative z-20 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          {stats.map((stat) => (
            <div key={stat.id} className="p-8 text-center group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors duration-300 cursor-default">
              <div className="flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {React.cloneElement(stat.icon as any, { className: "w-10 h-10 opacity-70 group-hover:opacity-100 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300" })}
              </div>
              <div className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-blue-600 group-hover:to-indigo-600 dark:group-hover:from-blue-400 dark:group-hover:to-indigo-400 transition-all duration-300">
                <CountUp end={stat.endValue} suffix={stat.suffix} decimals={stat.decimals} duration={2.5} enableScrollSpy scrollSpyOnce />
              </div>
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
