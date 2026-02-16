import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  isToggling: boolean;
  isHydrated: boolean;
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
  setIsToggling: (toggling: boolean) => void;
  hydrate: (serverTheme?: Theme) => void;
  /** Dev only: reset store để tránh state cũ sau HMR (gọi từ console: __resetZustand__()) */
  resetForDev: () => void;
}

const initialState = {
  theme: "light" as Theme,
  isToggling: false,
  isHydrated: false,
};

/**
 * Zustand store for Theme state
 * Used alongside ThemeContext for View Transition API support
 * Note: Nếu dùng persist middleware, nên tắt trong dev: storage: process.env.NODE_ENV === "development" ? undefined : ...
 */
export const useThemeStore = create<ThemeState & ThemeActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setTheme: (theme) => {
        set({ theme });
        // Sync with DOM
        if (typeof window !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
      },

      setIsToggling: (toggling) => set({ isToggling: toggling }),

      resetForDev: () => {
        if (process.env.NODE_ENV === "development") {
          set(initialState);
        }
      },

      hydrate: (serverTheme) => {
        if (get().isHydrated) return;

        let theme: Theme = "light";

        if (typeof window !== "undefined") {
          // Priority: serverTheme > DOM class > default
          if (serverTheme) {
            theme = serverTheme;
          } else {
            theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
          }
        }

        set({ theme, isHydrated: true });
      },
    }),
    { name: "theme-store" },
  ),
);

// Selectors
export const selectTheme = (state: ThemeState & ThemeActions) => state.theme;
export const selectIsToggling = (state: ThemeState & ThemeActions) => state.isToggling;

/**
 * Dev only: Reset tất cả Zustand stores để tránh state cũ sau HMR.
 * Gọi từ Console: __resetZustand__() rồi refresh trang (hoặc chờ HMR tự cập nhật).
 * Thay cho hard refresh (Ctrl+Shift+R) khi UI bị lỗi do state cũ.
 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).__resetZustand__ = () => {
    useThemeStore.getState().resetForDev();
    console.log("[Zustand Dev] Stores reset. Nếu UI vẫn lỗi, thử hard refresh (Ctrl+Shift+R).");
  };
}
