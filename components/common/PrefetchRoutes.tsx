"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Component để prefetch các routes quan trọng dựa trên context
 * Prefetch khi user idle để tăng tốc độ navigation
 */
export default function PrefetchRoutes() {
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Only prefetch likely next routes (immediate children)
  const prefetchRoutes = useCallback(() => {
    if (!pathname) return;

    // Prefetch routes dựa trên current path - chỉ prefetch immediate children
    if (pathname.startsWith("/admin")) {
      // ✅ Only prefetch immediate admin children
      router.prefetch("/admin/classes");
      router.prefetch("/admin/students");
    } else if (pathname.startsWith("/user")) {
      // ✅ Only prefetch immediate user children
      router.prefetch("/user/classes");
      router.prefetch("/user/documents");
    } else if (pathname === "/") {
      // ✅ Don't prefetch both admin and user at root - wait for user navigation
      // Only prefetch if user is likely to navigate (not implemented here to save bandwidth)
    }
  }, [pathname, router]);

  useEffect(() => {
    // ✅ Add debounce và cleanup
    let timeoutId: NodeJS.Timeout | null = null;
    let idleCallbackId: number | null = null;

    const prefetchOnIdle = () => {
      if (typeof window === "undefined") return;

      if ("requestIdleCallback" in window) {
        // ✅ Use longer timeout to avoid blocking main thread
        idleCallbackId = requestIdleCallback(
          () => {
            prefetchRoutes();
          },
          { timeout: 5000 } // ✅ Longer timeout (5s instead of 2s)
        );
      } else {
        // ✅ Fallback with longer delay
        timeoutId = setTimeout(() => {
        prefetchRoutes();
        }, 3000); // ✅ Longer delay (3s instead of 2s)
      }
    };

    // ✅ Debounce: Wait 1 second after navigation before prefetching
    timeoutId = setTimeout(() => {
    prefetchOnIdle();
    }, 1000);

    // ✅ Cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (idleCallbackId && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        cancelIdleCallback(idleCallbackId);
      }
    };
  }, [prefetchRoutes]);

  return null; // Component không render gì
}
