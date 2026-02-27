"use client";

import React, { memo } from "react";
import { Typography } from "antd";

const { Text } = Typography;

interface DataLoadingSplashProps {
  tip?: string;
}

const DataLoadingSplash = memo(({ tip = "ĐANG TẢI DỮ LIỆU..." }: DataLoadingSplashProps) => {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="flex flex-col items-center justify-center space-y-3">
        {/* Logo and Spin Section */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Subtle Glow */}
          <div className="absolute inset-8 bg-indigo-500/5 rounded-full blur-2xl"></div>

          {/* Segmented Spinning Ring (Main) */}
          <div
            className="absolute inset-2 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, #6366f1 0deg 110deg, transparent 110deg 120deg, #a855f7 120deg 230deg, transparent 230deg 240deg, #3b82f6 240deg 350deg, transparent 350deg 360deg)",
              animation: "spin 2s linear infinite",
              padding: "3px",
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
            }}
          ></div>

          {/* Slower Segmented Ring (Outer) */}
          <div
            className="absolute inset-0 rounded-full opacity-20"
            style={{
              background:
                "conic-gradient(from 120deg, #6366f1 0deg 60deg, transparent 60deg 180deg, #6366f1 180deg 240deg, transparent 240deg 360deg)",
              animation: "spin-reverse 6s linear infinite",
              padding: "1.5px",
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 1.5px), black calc(100% - 1.5px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 1.5px), black calc(100% - 1.5px))",
            }}
          ></div>

          {/* Logo Circle */}
          <div className="relative z-10 w-20 h-20 rounded-full bg-linear-to-br from-indigo-600 via-purple-600 to-blue-600 shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-500 ring-4 ring-white dark:ring-gray-900">
            <span className="text-white text-3xl font-black tracking-tighter">AIO</span>
          </div>
        </div>

        {/* Branding & Status Text */}
        <div className="flex flex-col items-center space-y-3">
          <div className="text-center group">
            <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.25em]">HỆ THỐNG AIO</h1>
            <div className="h-0.5 w-10 bg-linear-to-r from-indigo-600 to-blue-600 mx-auto rounded-full mt-1.5 opacity-60"></div>
          </div>

          <div className="flex items-center gap-2.5 bg-gray-50/50 dark:bg-gray-900/50 px-5 py-2 rounded-full border border-gray-100/80 dark:border-gray-800">
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full bg-indigo-500 dark:bg-indigo-400"
                  style={{
                    animation: "loading-dot 1.4s infinite ease-in-out both",
                    animationDelay: `${i * 0.15}s`,
                  }}
                ></div>
              ))}
            </div>
            <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest">{tip}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center">
          <Text className="text-gray-400 dark:text-gray-600 text-[9px] font-bold uppercase tracking-[0.4em] opacity-30">PREMIUM LEARNING EXPERIENCE</Text>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes loading-dot {
          0%,
          80%,
          100% {
            transform: scale(0);
            opacity: 0.3;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
});

DataLoadingSplash.displayName = "DataLoadingSplash";

export default DataLoadingSplash;
