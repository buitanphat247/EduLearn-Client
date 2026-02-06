"use client";

import { useEffect, useRef } from "react";
import { ConfigProvider, App, theme as antTheme } from "antd";
import { ThemeProvider, useTheme } from "@/app/context/ThemeContext";
import ErrorBoundary from "@/app/error-boundary";
import { WebVitalsTracker } from "@/app/components/common/WebVitalsTracker";

function AntdConfigProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          fontFamily: "inherit",
          colorBgContainer: isDark ? "#1e293b" : "#ffffff",
          colorBorder: isDark ? "#334155" : "#e2e8f0",
          colorPrimary: "#3b82f6",
          borderRadius: 12,
        },
        components: {
          Button: {
            colorPrimary: "#3b82f6",
            borderRadius: 10,
          },
          Input: {
            colorBgContainer: isDark ? "#0f172a" : "#f8fafc",
            colorBorder: isDark ? "#334155" : "#e2e8f0",
          },
          Select: {
            colorBgContainer: isDark ? "#0f172a" : "#f8fafc",
            colorBorder: isDark ? "#334155" : "#e2e8f0",
          },
          Card: {
            colorBgContainer: isDark ? "#1e293b" : "#ffffff",
          }
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}

/**
 * Providers Component với Error Boundary và Performance Monitoring
 * 
 * Features:
 * - Error Boundary: Catch errors trong providers
 * - Web Vitals Tracking: Monitor Core Web Vitals
 * - Performance Monitoring: Track provider render time
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const renderStartTime = useRef<number | null>(null);

  useEffect(() => {
    // Record render start time on mount
    if (typeof window !== "undefined") {
      renderStartTime.current = performance.now();
    }

    // Measure provider mount time after render
    return () => {
      if (typeof window !== "undefined" && renderStartTime.current !== null) {



      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AntdConfigProvider>
          <WebVitalsTracker />
          {children}
        </AntdConfigProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

