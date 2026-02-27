"use client";

import React, { memo, useState, useEffect } from "react";
import { Typography } from "antd";
import { SafetyCertificateOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface AccessCheckSplashProps {
  tip?: string;
}

const AccessCheckSplash = memo(({ tip = "Đang kiểm tra quyền truy cập..." }: AccessCheckSplashProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showCheckmark, setShowCheckmark] = useState(false);

  useEffect(() => {
    const checkTimer = setTimeout(() => {
      setShowCheckmark(true);
    }, 1000);

    return () => clearTimeout(checkTimer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center bg-white/40 backdrop-blur-2xl transition-all duration-700 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-110"
      }`}
    >
      <div className="flex flex-col items-center justify-center relative max-w-lg w-full px-6">
        {/* Complex Animated Background Layers */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-indigo-200/20 rounded-full blur-[120px] animate-pulse"></div>
          <div
            className="absolute top-20 right-0 w-full h-full bg-blue-200/20 rounded-full blur-[100px] animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-0 left-20 w-full h-full bg-violet-200/20 rounded-full blur-[100px] animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Main Floating Card Container */}
        <div className="relative group z-10 w-full max-w-[320px]">
          {/* External Halo Effects */}
          <div
            className={`absolute -inset-10 rounded-full transition-all duration-1000 blur-3xl ${
              showCheckmark ? "bg-green-400/10 scale-110" : "bg-indigo-400/10 scale-100 animate-pulse"
            }`}
          ></div>
          <div
            className={`absolute -inset-16 rounded-full transition-all duration-1500 blur-3xl opacity-30 ${
              showCheckmark ? "bg-emerald-400/5" : "bg-blue-400/5 animate-pulse"
            }`}
            style={{ animationDelay: "0.5s" }}
          ></div>

          {/* Premium Glass Card */}
          <div className="relative bg-white/80 backdrop-blur-xl p-12 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/60 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 hover:shadow-[0_48px_80px_-20px_rgba(0,0,0,0.12)]">
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-indigo-50/20 via-transparent to-blue-50/20 pointer-events-none"></div>

            {/* Icon Portal - Shield */}
            <div className="relative mb-2">
              <div
                className={`relative transition-all duration-700 ${showCheckmark ? "scale-90 opacity-40" : "animate-bounce"}`}
                style={{ animationDuration: "3s" }}
              >
                <SafetyCertificateOutlined className="text-8xl text-gray-800" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.05))" }} />
              </div>

              {/* Checkmark Animation Container */}
              <div
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out-back ${
                  showCheckmark ? "opacity-100 scale-110" : "opacity-0 scale-50"
                }`}
              >
                <div className="relative bg-white rounded-full p-2 shadow-xl border-4 border-white">
                  <CheckCircleOutlined className="text-5xl text-green-500" style={{ filter: "drop-shadow(0 4px 12px rgba(34,197,94,0.3))" }} />
                  <div className="absolute -inset-2 bg-green-500/20 rounded-full animate-ping"></div>
                </div>
              </div>

              {/* Spinning Progress Ring */}
              {!showCheckmark && (
                <div className="absolute -inset-4 transition-opacity duration-300">
                  <div className="w-full h-full border-4 border-indigo-100/30 rounded-full"></div>
                  <div
                    className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"
                    style={{ animationDuration: "1.5s" }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messaging Section */}
        <div className="text-center mt-12 space-y-4 z-20">
          <div className="relative overflow-hidden">
            <h3 className="text-2xl font-black text-gray-800 tracking-tight leading-tight">
              {showCheckmark ? (
                <span className="inline-block animate-in slide-in-from-bottom-2 fade-in duration-500">Quyền truy cập hợp lệ</span>
              ) : (
                <span className="inline-block animate-pulse">{tip}</span>
              )}
            </h3>
          </div>

          <Text
            className={`text-md font-medium tracking-wide block transition-colors duration-500 ${showCheckmark ? "text-green-600" : "text-gray-400"}`}
          >
            {showCheckmark ? "Đang tải dữ liệu, vui lòng đợi..." : "Vui lòng đợi giây lát..."}
          </Text>

          {/* Clean Stepper Dots */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${showCheckmark ? "w-2 bg-green-500" : `w-2 bg-indigo-200 animate-pulse`}`}
                style={{ animationDelay: `${i * 200}ms` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

AccessCheckSplash.displayName = "AccessCheckSplash";

export default AccessCheckSplash;
