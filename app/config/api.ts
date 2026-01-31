import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getCookie, clearCookieCache } from "@/lib/utils/cookies";

const isDev = process.env.NODE_ENV === "development";

const getBaseURL = (): string => {
  if (typeof window !== "undefined") return "/api-proxy";
  const envURL = process.env.NEXT_PUBLIC_API_URL;
  if (envURL?.trim()) {
    try {
      new URL(envURL);
      return envURL;
    } catch {}
  }
  return "http://localhost:1611/api";
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Auth cache
let cachedAuthHeader: string | null = null;
let cachedAuthTimestamp = 0;
const AUTH_CACHE_TTL = 500; // 500ms cache

const getCachedAuthHeader = (): string | null => {
  if (typeof window === "undefined") return null;
  const now = Date.now();
  if (cachedAuthHeader && now - cachedAuthTimestamp < AUTH_CACHE_TTL) {
    return cachedAuthHeader;
  }
  const atCookie = getCookie("_at");
  if (atCookie) {
    cachedAuthHeader = `Bearer ${atCookie}`;
    cachedAuthTimestamp = now;
    return cachedAuthHeader;
  }
  cachedAuthHeader = null;
  return null;
};

export const clearAuthCache = (): void => {
  cachedAuthHeader = null;
  cachedAuthTimestamp = 0;
  clearCookieCache();
};

export const setTokens = (_accessToken: string, _refreshToken?: string): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const clearTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  try {
    sessionStorage.removeItem("edulearn_user_id");
    sessionStorage.removeItem("edulearn_user_data");
  } catch {}
  document.cookie = "_at=; path=/; max-age=0";
  document.cookie = "_u=; path=/; max-age=0";
  clearAuthCache();
};

// Refresh token state
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v?: any) => void; reject: (e?: any) => void }> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// Response cache
const responseCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 30000;

const getCacheKey = (config: InternalAxiosRequestConfig): string | null => {
  if (config.method?.toLowerCase() !== "get") return null;
  const url = config.url || "";
  if (url.includes("/auth/")) return null;
  return `${url}?${config.params ? JSON.stringify(config.params) : ""}`;
};

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { _retry?: boolean }) => {
    const isRefreshReq = config.url?.includes("/auth/refresh");
    const isRetry = config._retry === true;

    if (!isRefreshReq && !isRetry) {
      const auth = getCachedAuthHeader();
      if (auth) config.headers.Authorization = auth;
    } else if (isRetry && config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    const key = getCacheKey(response.config);
    if (key) {
      responseCache.set(key, { data: response.data, ts: Date.now() });
      if (responseCache.size > 50) {
        const entries = [...responseCache.entries()].sort((a, b) => a[1].ts - b[1].ts);
        for (let i = 0; i < 10; i++) responseCache.delete(entries[i][0]);
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!error.response) {
      return Promise.reject({ ...error, message: "Không thể kết nối đến server" });
    }

    const { status, data } = error.response;
    const errorCode = (data as any)?.code;
    const errorMessage = (data as any)?.message || "Có lỗi xảy ra";

    if (status !== 401) {
      return Promise.reject({ ...error, message: errorMessage, code: errorCode });
    }

    // 401 handling
    const isAuthReq = originalRequest?.url?.includes("/auth/signin") || originalRequest?.url?.includes("/auth/signup");
    if (isAuthReq) {
      return Promise.reject({ ...error, message: errorMessage, code: errorCode });
    }

    // Critical errors - logout immediately
    const criticalErrors = ["REFRESH_TOKEN_EXPIRED", "INVALID_REFRESH_TOKEN", "USER_BANNED"];
    if (criticalErrors.includes(errorCode)) {
      if (isDev) console.log("[API] Critical error:", errorCode);
      clearTokens();
      processQueue(error, null);
      isRefreshing = false;
      if (typeof window !== "undefined") window.location.href = "/auth";
      return Promise.reject({ ...error, code: errorCode, message: errorMessage });
    }

    // ACCESS_TOKEN_EXPIRED or no code - try refresh
    if (errorCode === "ACCESS_TOKEN_EXPIRED" || !errorCode) {
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        // Queue if already refreshing
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              if (originalRequest.headers) delete originalRequest.headers.Authorization;
              clearAuthCache();
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        // Start refresh
        isRefreshing = true;
        if (isDev) console.log("[API] Refreshing token...");

        try {
          const response = await axios.post(
            "/api-proxy/auth/refresh",
            {},
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            },
          );

          const accessToken =
            response.data?.access_token || response.data?.data?.access_token || response.data?.accessToken || response.data?.cookies?._at?.value;

          if (!accessToken) throw new Error("No access token received from server");

          // Set cookies from response body (fallback for proxy issues)
          const cookies = response.data?.cookies;
          if (cookies?._at) {
            const exp = new Date(Date.now() + cookies._at.maxAge);
            document.cookie = `_at=${encodeURIComponent(cookies._at.value)}; path=/; expires=${exp.toUTCString()}; SameSite=Lax`;
          }
          if (cookies?._u) {
            const exp = new Date(Date.now() + cookies._u.maxAge);
            document.cookie = `_u=${encodeURIComponent(cookies._u.value)}; path=/; expires=${exp.toUTCString()}; SameSite=Lax`;
          }

          clearAuthCache();
          if (originalRequest.headers) delete originalRequest.headers.Authorization;
          processQueue(null, accessToken);
          isRefreshing = false;

          if (isDev) console.log("[API] Token refreshed successfully");
          return apiClient(originalRequest);
        } catch (refreshError: any) {
          const code = refreshError?.response?.data?.code;
          if (isDev) console.log("[API] Refresh failed:", code);

          clearTokens();
          processQueue(refreshError as AxiosError, null);
          isRefreshing = false;
          if (typeof window !== "undefined") window.location.href = "/auth";
          return Promise.reject(refreshError);
        }
      } else {
        // Already retried - check if critical
        if (criticalErrors.includes(errorCode) || errorCode === "ACCESS_TOKEN_EXPIRED") {
          clearTokens();
          if (typeof window !== "undefined") window.location.href = "/auth";
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject({ ...error, code: errorCode, message: errorMessage });
  },
);

export const getCachedResponse = (url: string, params?: any): any | null => {
  const key = params ? `${url}?${JSON.stringify(params)}` : `${url}?`;
  const cached = responseCache.get(key);
  return cached && Date.now() - cached.ts < CACHE_TTL ? cached.data : null;
};

export const clearResponseCache = (): void => responseCache.clear();

export const clearCacheByPattern = (pattern: string | RegExp): void => {
  [...responseCache.keys()].forEach((key) => {
    if ((typeof pattern === "string" && key.includes(pattern)) || (pattern instanceof RegExp && pattern.test(key))) {
      responseCache.delete(key);
    }
  });
};

export default apiClient;
