"use client";

import { useReportWebVitals } from "next/web-vitals";
import { reportWebVitals } from "@/lib/utils/web-vitals";

/**
 * Web Vitals Tracker Component
 * Tracks Core Web Vitals metrics và gửi về analytics service
 */
export function WebVitalsTracker() {
  useReportWebVitals((metric: any) => {
    reportWebVitals(metric);
  });

  return null; // Component không render gì
}
