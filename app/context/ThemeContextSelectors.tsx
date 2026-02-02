/**
 * Theme Context Selectors
 * 
 * Selectors để optimize re-renders khi chỉ cần một phần của context
 * Thay vì subscribe toàn bộ context, component chỉ subscribe phần cần thiết
 */

import { useContext, useMemo } from "react";
import { ThemeContext } from "./ThemeContext";

/**
 * Hook để chỉ lấy theme value (không re-render khi toggleTheme thay đổi)
 */
export function useThemeValue() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeValue must be used within a ThemeProvider");
  }
  
  // Chỉ return theme, không return toggleTheme
  // Component sẽ không re-render khi toggleTheme function reference thay đổi
  return context.theme;
}

/**
 * Hook để chỉ lấy toggleTheme function (không re-render khi theme thay đổi)
 * ⚠️ Lưu ý: Thường không cần thiết vì toggleTheme thường được dùng cùng với theme
 */
export function useToggleTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useToggleTheme must be used within a ThemeProvider");
  }
  
  // Memoize function để tránh re-render không cần thiết
  return useMemo(() => context.toggleTheme, [context.toggleTheme]);
}

/**
 * Hook để check isDark mode (derived value)
 * Optimize bằng cách memoize boolean value
 */
export function useIsDark() {
  const theme = useThemeValue();
  return useMemo(() => theme === "dark", [theme]);
}
