"use client";

import { useEffect } from "react";
import { reportWebVitals } from "@/lib/utils/web-vitals";

/**
 * Web Vitals Tracker Component
 * Tracks Core Web Vitals metrics và gửi về analytics service
 */
export function WebVitalsTracker() {
  useEffect(() => {
    // Dynamic import để tránh lỗi nếu next/web-vitals không available
    if (typeof window === "undefined") return;

    // Import next/web-vitals dynamically
    import("next/web-vitals")
      .then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
        // Track Core Web Vitals - chỉ track nếu function tồn tại
        if (typeof onCLS === "function") onCLS(reportWebVitals);
        if (typeof onFID === "function") onFID(reportWebVitals);
        if (typeof onFCP === "function") onFCP(reportWebVitals);
        if (typeof onLCP === "function") onLCP(reportWebVitals);
        if (typeof onTTFB === "function") onTTFB(reportWebVitals);
        if (typeof onINP === "function") onINP(reportWebVitals);
      })
      .catch((err) => {
        // Silent fail - Web Vitals tracking is optional
        if (process.env.NODE_ENV === "development") {
          console.warn("[WebVitalsTracker] Failed to load web-vitals:", err);
        }
      });
  }, []);

  return null; // Component không render gì
}
