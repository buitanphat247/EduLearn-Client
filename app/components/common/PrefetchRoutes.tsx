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

  const prefetchRoutes = useCallback(() => {
    // Prefetch routes dựa trên current path
    if (pathname?.startsWith("/admin")) {
      // Admin routes
      router.prefetch("/admin");
      router.prefetch("/admin/classes");
      router.prefetch("/admin/students");
      router.prefetch("/admin/document-crawl");
      router.prefetch("/admin/settings");
    } else if (pathname?.startsWith("/user")) {
      // User routes
      router.prefetch("/user");
      router.prefetch("/user/classes");
      router.prefetch("/user/documents");
      router.prefetch("/user/settings");
    } else {
      // Root routes - prefetch cả admin và user (để sẵn sàng)
      router.prefetch("/admin");
      router.prefetch("/admin/classes");
      router.prefetch("/user");
      router.prefetch("/user/classes");
    }
  }, [pathname, router]);

  useEffect(() => {
    // Chỉ prefetch khi browser idle (không block main thread)
    if (typeof window === "undefined" || !("requestIdleCallback" in window)) {
      // Fallback cho browsers không support requestIdleCallback
      setTimeout(() => prefetchRoutes(), 2000);
      return;
    }

    const prefetchOnIdle = () => {
      requestIdleCallback(() => {
        prefetchRoutes();
      }, { timeout: 2000 });
    };

    prefetchOnIdle();
  }, [prefetchRoutes]);

  return null; // Component không render gì
}
