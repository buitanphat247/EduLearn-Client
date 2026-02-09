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
}

/**
 * Zustand store for Theme state
 * Used alongside ThemeContext for View Transition API support
 */
export const useThemeStore = create<ThemeState & ThemeActions>()(
  devtools(
    (set, get) => ({
      theme: "light", // Will be synced on client hydration
      isToggling: false,
      isHydrated: false,

      setTheme: (theme) => {
        set({ theme });
        // Sync with DOM
        if (typeof window !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
      },

      setIsToggling: (toggling) => set({ isToggling: toggling }),

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
