"use client";

import { useEffect, useState, useRef } from "react";

// Throttle function để giới hạn số lần gọi callback
const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Schedule call for remaining time
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
        timeoutId = null;
      }, delay - timeSinceLastCall);
    }
  };
};

const THROTTLE_DELAY_MS = 16; // ~60fps (16ms per frame)

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const throttledCalculateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const calculateScrollProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // Tính phần trăm scroll
      const scrollableHeight = documentHeight - windowHeight;
      const progress = scrollableHeight > 0 
        ? (scrollTop / scrollableHeight) * 100 
        : 0;
      
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    // Tính toán ban đầu
    calculateScrollProgress();

    // Tạo throttled version của calculateScrollProgress
    const throttledCalculate = throttle(calculateScrollProgress, THROTTLE_DELAY_MS);
    throttledCalculateRef.current = throttledCalculate;

    // Lắng nghe sự kiện scroll với throttling
    window.addEventListener("scroll", throttledCalculate, { passive: true });
    window.addEventListener("resize", throttledCalculate, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledCalculate);
      window.removeEventListener("resize", throttledCalculate);
      throttledCalculateRef.current = null;
    };
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-[100] transition-all duration-150 ease-out origin-left"
      style={{
        transform: `scaleX(${scrollProgress / 100})`,
        transformOrigin: "left",
      }}
    />
  );
}

