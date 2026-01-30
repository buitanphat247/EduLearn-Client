"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (e?: React.MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Get initial theme from document class (set by inline script in layout.tsx)
function getInitialTheme(): Theme {
  if (typeof window !== "undefined") {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  }
  return "light";
}

import { flushSync } from "react-dom";

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

// ... (Theme type definition lines 4-19 remain same, not replacing them, just Context logic below)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = useState(false);
  const transitionDuration = getThemeTransitionDuration();

  useEffect(() => {
    setMounted(true);
    // Sync state with actual DOM class (already set by inline script)
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = async (e?: React.MouseEvent) => {
    const newTheme = theme === "light" ? "dark" : "light";
    
    // Check if View Transition API is supported
    if (!(document as any).startViewTransition) {
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
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
         localStorage.setItem("theme", newTheme);
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
    } finally {
         // Re-enable transitions after the view transition is starting/ready
         // effectively we can remove it once the "new" snapshot is captured, 
         // which happens when .ready resolves. 
         // But keeping it off until animation finishes is also fine, 
         // though we usually want hover effects to work during the 1.5s animation?
         // Let's remove it when ready resolves.
         document.documentElement.classList.remove('no-transitions');
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
