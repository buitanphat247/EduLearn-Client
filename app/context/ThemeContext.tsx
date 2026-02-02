"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { setThemeCookie } from "../actions/theme";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (e?: React.MouseEvent) => Promise<void>;
}

interface ThemeRequest {
  id: number;
  abortController: AbortController;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Get initial theme from document class (set by inline script in layout.tsx)
function getInitialTheme(): Theme {
  if (typeof window !== "undefined") {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  }
  return "light";
}

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
  return 1500; // Default: 1.5 seconds
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const transitionDuration = getThemeTransitionDuration();
  // Track the latest request to prevent race conditions
  const requestRef = React.useRef<ThemeRequest | null>(null);
  const requestIdRef = React.useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    // Sync state with actual DOM class (already set by inline script)
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = async (e?: React.MouseEvent) => {
    // Prevent double-click / race condition
    if (isToggling) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[ThemeContext] Toggle ignored - already toggling");
      }
      return;
    }

    // Cancel previous request if exists
    if (requestRef.current) {
      requestRef.current.abortController.abort();
      if (process.env.NODE_ENV !== "production") {
        console.log("[ThemeContext] Cancelled previous request");
      }
    }

    setIsToggling(true);
    const newTheme = theme === "light" ? "dark" : "light";
    
    // Generate unique request ID
    const currentRequestId = ++requestIdRef.current;
    const abortController = new AbortController();
    
    // Track this request to prevent race conditions
    requestRef.current = { id: currentRequestId, abortController };

    try {
      // Check if View Transition API is supported
      if (!(document as any).startViewTransition) {
        setTheme(newTheme);
        // Remove localStorage setting to rely on cookie
        const result = await setThemeCookie(newTheme);
        
        // Check if this request is still the latest (prevent race condition)
        if (requestRef.current?.id !== currentRequestId || abortController.signal.aborted) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[ThemeContext] Request cancelled - newer request in progress");
          }
          return;
        }
        
        if (!result.success) {
          console.warn("[ThemeContext] Server action failed, using client-side fallback:", result.error);
          // Fallback to client-side cookie if server action fails
          document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
        }
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        return;
      }

      // Get click position or default to top-right corner
      const x = e?.clientX ?? window.innerWidth;
      const y = e?.clientY ?? 0;

      const endRadius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y)
      );

      // Disable transitions during the capture phase to ensure the new snapshot is the final state
      document.documentElement.classList.add('no-transitions');

      const transition = (document as any).startViewTransition(() => {
        // Flush updates to ensure React components are fully rendered in the new state
        // before the snapshot is taken
        flushSync(() => {
          setTheme(newTheme);
        });

        // Set theme cookie with proper error handling (non-blocking)
        // Capture request ID to check if request is still valid
        const cookieRequestId = currentRequestId;
        setThemeCookie(newTheme).then((result) => {
          // Check if this request is still the latest (prevent race condition)
          if (requestRef.current?.id !== cookieRequestId || abortController.signal.aborted) {
            if (process.env.NODE_ENV !== "production") {
              console.warn("[ThemeContext] Cookie request cancelled - newer request in progress");
            }
            return;
          }
          
          if (!result.success) {
            console.warn("[ThemeContext] Server action failed, using client-side fallback:", result.error);
            // Fallback to client-side cookie if server action fails
            document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
          }
        }).catch((error) => {
          // Only handle error if this is still the latest request and not aborted
          if (requestRef.current?.id === cookieRequestId && !abortController.signal.aborted) {
            console.error("[ThemeContext] Error setting theme cookie:", error);
          // Fallback to client-side cookie
          document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
          }
        });
        document.documentElement.classList.toggle("dark", newTheme === "dark");
      });

      // waiting for the transition to catch the "new" image
      try {
        await transition.ready;

        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        // Animate the new view expanding from the click position
        document.documentElement.animate(
          {
            clipPath: clipPath,
          },
          {
            duration: transitionDuration,
            easing: "cubic-bezier(0.25, 1, 0.5, 1)", // Smoother quart-like easing
            pseudoElement: "::view-transition-new(root)",
          }
        );
      } catch (error) {
        // Only handle error if this is still the latest request and not aborted
        if (requestRef.current?.id === currentRequestId && !abortController.signal.aborted) {
          console.error("[ThemeContext] Error during theme transition:", error);
        // Fallback: ensure theme is set even if transition fails
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        }
      } finally {
        // Only clean up if this is still the latest request
        if (requestRef.current?.id === currentRequestId && !abortController.signal.aborted) {
        // Re-enable transitions after the view transition is starting/ready
        // effectively we can remove it once the "new" snapshot is captured, 
        // which happens when .ready resolves. 
        // But keeping it off until animation finishes is also fine, 
        // though we usually want hover effects to work during the 1.5s animation?
        // Let's remove it when ready resolves.
        document.documentElement.classList.remove('no-transitions');
        }
      }
    } catch (error) {
      // Only handle error if this is still the latest request and not aborted
      if (requestRef.current?.id === currentRequestId && !abortController.signal.aborted) {
        console.error("[ThemeContext] Error during theme toggle:", error);
      // Fallback: ensure theme is set even if toggle fails
      setTheme(newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      }
    } finally {
      // Only reset toggling state if this is still the latest request
      if (requestRef.current?.id === currentRequestId) {
      setIsToggling(false);
        requestRef.current = null;
      } else {
        // If a newer request is in progress, don't reset isToggling
        if (process.env.NODE_ENV !== "production") {
          console.log("[ThemeContext] Skipping state reset - newer request in progress");
        }
      }
    }
  };

  // Don't hide content - inline script already set the correct theme class
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
