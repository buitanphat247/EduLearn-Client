"use client";

import { ConfigProvider, App, theme as antTheme } from "antd";
import { ThemeProvider, useTheme, type Theme } from "@/app/context/ThemeContext";
import ErrorBoundary from "@/app/error-boundary";
import { WebVitalsTracker } from "@/app/components/common/WebVitalsTracker";
import { QueryProvider } from "@/lib/providers/QueryProvider";

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
 * Providers Component with Error Boundary, React Query, and Performance Monitoring
 * 
 * Stack:
 * - ErrorBoundary: Catch errors in providers
 * - ThemeProvider: Theme context for light/dark mode
 * - QueryProvider: React Query for server state management
 * - AntdConfigProvider: Ant Design theming
 * - WebVitalsTracker: Core Web Vitals monitoring
 */
export function Providers({ children, theme }: { children: React.ReactNode; theme?: Theme }) {
  return (
    <ErrorBoundary>
      <ThemeProvider initialTheme={theme}>
        <QueryProvider>
          <AntdConfigProvider>
            <WebVitalsTracker />
            {children}
          </AntdConfigProvider>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
