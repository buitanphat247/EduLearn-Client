"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { setThemeCookie } from "../actions/theme";
import { useThemeStore, type Theme } from "@/lib/stores/themeStore";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (e?: React.MouseEvent) => Promise<void>;
}

interface ThemeRequest {
  id: number;
  abortController: AbortController;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Re-export Theme type
export type { Theme };

// Get theme transition duration from environment variable (default: 1500ms)
const getThemeTransitionDuration = (): number => {
  if (typeof window !== "undefined") {
    const envDuration = process.env.NEXT_PUBLIC_THEME_TRANSITION_DURATION;
    if (envDuration) {
      const parsed = parseInt(envDuration, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }
  return 1500;
};

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode; initialTheme?: Theme }) {
  // Use Zustand store for state
  const { theme, setTheme, isToggling, setIsToggling, hydrate } = useThemeStore();

  const transitionDuration = getThemeTransitionDuration();
  const requestRef = useRef<ThemeRequest | null>(null);
  const requestIdRef = useRef<number>(0);

  // Hydrate store on mount
  useEffect(() => {
    hydrate(initialTheme);
  }, [initialTheme, hydrate]);

  const toggleTheme = async (e?: React.MouseEvent) => {
    if (isToggling) {
      return;
    }

    // Cancel previous request if exists
    if (requestRef.current) {
      requestRef.current.abortController.abort();
    }

    setIsToggling(true);
    const newTheme = theme === "light" ? "dark" : "light";

    const currentRequestId = ++requestIdRef.current;
    const abortController = new AbortController();
    requestRef.current = { id: currentRequestId, abortController };

    try {
      // Check if View Transition API is supported
      if (!(document as any).startViewTransition) {
        setTheme(newTheme);
        const result = await setThemeCookie(newTheme);

        if (requestRef.current?.id !== currentRequestId || abortController.signal.aborted) {
          return;
        }

        if (!result.success) {
          document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
        }
        return;
      }

      document.documentElement.classList.add("no-transitions");

      const transition = (document as any).startViewTransition(() => {
        flushSync(() => {
          setTheme(newTheme);
        });

        const cookieRequestId = currentRequestId;
        setThemeCookie(newTheme)
          .then((result) => {
            if (requestRef.current?.id !== cookieRequestId || abortController.signal.aborted) {
              return;
            }
            if (!result.success) {
              document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
            }
          })
          .catch(() => {
            if (requestRef.current?.id === cookieRequestId && !abortController.signal.aborted) {
              document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
            }
          });
      });

      try {
        await transition.ready;

        document.documentElement.animate(
          { opacity: [1, 0] },
          {
            duration: transitionDuration / 2,
            easing: "ease-out",
            pseudoElement: "::view-transition-old(root)",
            fill: "forwards",
          }
        );

        document.documentElement.animate(
          { opacity: [0, 1] },
          {
            duration: transitionDuration / 2,
            easing: "ease-in",
            pseudoElement: "::view-transition-new(root)",
            fill: "forwards",
          }
        );
      } catch {
        if (requestRef.current?.id === currentRequestId && !abortController.signal.aborted) {
          setTheme(newTheme);
        }
      } finally {
        if (requestRef.current?.id === currentRequestId && !abortController.signal.aborted) {
          document.documentElement.classList.remove("no-transitions");
        }
      }
    } catch {
      if (requestRef.current?.id === currentRequestId && !abortController.signal.aborted) {
        setTheme(newTheme);
      }
    } finally {
      if (requestRef.current?.id === currentRequestId) {
        setIsToggling(false);
        requestRef.current = null;
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
