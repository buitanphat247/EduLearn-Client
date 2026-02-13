"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

const AUTH_REDIRECT_EVENT = "auth:redirect-to-login";
const REDIRECT_DEBOUNCE_MS = 400;

/** Fallback: nếu sau 300ms vẫn chưa ở /auth thì dùng location.href (trường hợp listener chưa mount). */
const FALLBACK_REDIRECT_MS = 300;

export function dispatchAuthRedirect(path: string) {
  if (typeof window === "undefined") return;
  const toAuth = path.startsWith("/auth");
  if (toAuth && window.location.pathname === "/auth") return;
  window.dispatchEvent(new CustomEvent(AUTH_REDIRECT_EVENT, { detail: { path } }));
  window.setTimeout(() => {
    if (window.location.pathname !== "/auth") window.location.href = path;
  }, FALLBACK_REDIRECT_MS);
}

export default function AuthRedirectListener() {
  const router = useRouter();
  const pathname = usePathname();
  const lastRedirectAtRef = useRef(0);

  useEffect(() => {
    const handle = (e: CustomEvent<{ path: string }>) => {
      const path = e.detail?.path || "/auth";
      const normalizedPath = path.split("?")[0] || "/auth";
      if (pathname === normalizedPath) return;
      const now = Date.now();
      if (now - lastRedirectAtRef.current < REDIRECT_DEBOUNCE_MS) return;
      lastRedirectAtRef.current = now;
      router.push(path);
    };
    window.addEventListener(AUTH_REDIRECT_EVENT, handle as EventListener);
    return () => window.removeEventListener(AUTH_REDIRECT_EVENT, handle as EventListener);
  }, [router, pathname]);

  return null;
}
