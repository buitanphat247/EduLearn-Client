/**
 * Theme Context Selectors
 * 
 * Selectors để optimize re-renders khi chỉ cần một phần của context
 * Thay vì subscribe toàn bộ context, component chỉ subscribe phần cần thiết
 */

import { useContext, useMemo } from "react";
import { ThemeContext } from "./ThemeContext";
import { useThemeStore } from "@/lib/stores/themeStore";

/**
 * Hook để chỉ lấy theme value
 * ✅ Tối ưu: Dùng trực tiếp Zustand selector để ngăn re-render toàn diện ở những component
 * chỉ muốn lắng nghe CSS theme thay vì toàn bộ ThemeContext
 */
export function useThemeValue() {
  return useThemeStore((state) => state.theme);
}

/**
 * Hook để chỉ lấy toggleTheme function
 */
export function useToggleTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useToggleTheme must be used within a ThemeProvider");
  }
  return context.toggleTheme;
}

/**
 * Hook để check isDark mode (derived value)
 * ✅ Đã gỡ bỏ useMemo vì primitive type (boolean) không hề cần tốn RAM và chi phí
 * closure rác để memoize - So sánh trực tiếp là tốt nhất.
 */
export function useIsDark() {
  const theme = useThemeValue();
  return theme === "dark";
}
