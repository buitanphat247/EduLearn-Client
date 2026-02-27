/**
 * Shared API base URL – dùng cho mọi nơi cần gọi API (fetch, axios, ...).
 * Production client: gọi trực tiếp api.edulearning.io.vn (tránh Vercel cold start).
 * Không import từ api.ts hay csrf để tránh circular dependency.
 */

const isDev = process.env.NODE_ENV === "development";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    if (process.env.NODE_ENV === "production") {
      const envURL = process.env.NEXT_PUBLIC_API_URL;
      if (envURL?.trim()) {
        try {
          new URL(envURL);
          return envURL;
        } catch {}
      }
      return "https://api.edulearning.io.vn/api";
    }
    return "/api-proxy";
  }
  const envURL = process.env.NEXT_PUBLIC_API_URL;
  if (envURL?.trim()) {
    try {
      new URL(envURL);
      return envURL;
    } catch {}
  }
  return isDev ? "http://localhost:1611/api" : "https://api.edulearning.io.vn/api";
}
