"use client";

import React, { memo, useState, useEffect } from "react";
import { Typography } from "antd";
import { ThunderboltFilled } from "@ant-design/icons";

const { Text } = Typography;

const LoadingState = memo(() => {
  const [isSpinning, setIsSpinning] = useState(true);

  useEffect(() => {
    // Stop spinning after 250ms
    const timer = setTimeout(() => {
      setIsSpinning(false);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full relative overflow-hidden">
      {/* Background decorative circles */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-200 dark:bg-indigo-900/30 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div
        className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200 dark:bg-blue-900/30 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Main Spinner */}
      <div className="relative mb-8 z-10">
        {/* Outer spinning ring */}
        <div
          className={`w-24 h-24 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-500 rounded-full ${isSpinning ? "animate-spin" : ""}`}
        ></div>

        {/* Inner spinning ring */}
        <div
          className={`absolute top-2 left-2 w-20 h-20 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-500 rounded-full ${isSpinning ? "animate-spin" : ""}`}
          style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
        ></div>

        {/* Center icon */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <ThunderboltFilled className="text-3xl text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-2 z-10">
        <Text className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-wide">Đang tải nội dung AI</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 block">Vui lòng đợi trong giây lát...</Text>
      </div>
    </div>
  );
});

LoadingState.displayName = "LoadingState";

export default LoadingState;
