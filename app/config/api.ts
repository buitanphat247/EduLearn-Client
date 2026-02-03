/**
 * API Client Configuration
 * @module app/config/api
 * @description Centralized API client configuration with environment variable support and validation
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getCookie, clearCookieCache } from "@/lib/utils/cookies";

const isDev = process.env.NODE_ENV === "development";

/**
 * Get base URL for API requests
 * @returns {string} Base URL for API client
 * @description 
 * - Client-side: Uses '/api-proxy' route
 * - Server-side: Uses NEXT_PUBLIC_API_URL env variable or defaults to localhost
 * - Validates URL format before returning
 */
const getBaseURL = (): string => {
  if (typeof window !== "undefined") return "/api-proxy";
  
  // ✅ Use environment variable with validation
  const envURL = process.env.NEXT_PUBLIC_API_URL;
  if (envURL?.trim()) {
    try {
      new URL(envURL);
      return envURL;
    } catch {
      if (isDev) {
        console.warn(`[API Config] Invalid NEXT_PUBLIC_API_URL: ${envURL}, using default`);
      }
    }
  }
  
  // ✅ Default fallback (should be overridden by env var in production)
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:1611/api";
};

/**
 * API timeout in milliseconds
 * @constant {number}
 * @default 30000
 * @description Can be overridden via NEXT_PUBLIC_API_TIMEOUT env variable
 */
const API_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000;

/**
 * Auth cache TTL in milliseconds
 * @constant {number}
 * @default 5000
 * @description How long to cache auth headers before re-validating
 */
const AUTH_CACHE_TTL = Number(process.env.NEXT_PUBLIC_AUTH_CACHE_TTL) || 5000;

/**
 * Response cache TTL in milliseconds
 * @constant {number}
 * @default 30000
 * @description How long to cache GET responses
 */
const CACHE_TTL = Number(process.env.NEXT_PUBLIC_RESPONSE_CACHE_TTL) || 30000;

/**
 * Maximum response cache size
 * @constant {number}
 * @default 50
 * @description Maximum number of cached responses
 */
const MAX_CACHE_SIZE = Number(process.env.NEXT_PUBLIC_MAX_CACHE_SIZE) || 50;

/**
 * Cache cleanup threshold
 * @constant {number}
 * @default 40
 * @description Start cleanup when cache reaches this size
 */
const CACHE_CLEANUP_THRESHOLD = Number(process.env.NEXT_PUBLIC_CACHE_CLEANUP_THRESHOLD) || 40;

/**
 * Maximum queue size for token refresh requests
 * @constant {number}
 * @default 500
 * @description Maximum number of queued requests during token refresh
 */
const MAX_QUEUE_SIZE = Number(process.env.NEXT_PUBLIC_MAX_REFRESH_QUEUE_SIZE) || 500;

/**
 * Queue timeout in milliseconds
 * @constant {number}
 * @default 30000
 * @description Timeout for queued requests during token refresh
 */
const QUEUE_TIMEOUT = Number(process.env.NEXT_PUBLIC_REFRESH_QUEUE_TIMEOUT) || 30000;

/**
 * API Client instance
 * @type {AxiosInstance}
 * @description Configured axios instance with base URL, timeout, and credentials
 */
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: API_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ✅ Auth cache with improved TTL và validation
let cachedAuthHeader: string | null = null;
let cachedAuthTimestamp = 0;

/**
 * Get cached auth header with validation
 * @returns {string | null} Cached authorization header or null
 * @description 
 * - Checks cache validity (TTL)
 * - Verifies token still exists in cookies
 * - Invalidates cache if token changed
 */
const getCachedAuthHeader = (): string | null => {
  if (typeof window === "undefined") return null;
  const now = Date.now();
  
  // ✅ Check if cache is still valid
  if (cachedAuthHeader && now - cachedAuthTimestamp < AUTH_CACHE_TTL) {
    // ✅ Verify token still exists
    const atCookie = getCookie("_at");
    if (atCookie && atCookie === cachedAuthHeader.replace("Bearer ", "")) {
      return cachedAuthHeader;
    }
    // ✅ Token changed - invalidate cache
    cachedAuthHeader = null;
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

/**
 * Clear auth cache
 * @description Clears cached auth header and cookie cache
 */
export const clearAuthCache = (): void => {
  cachedAuthHeader = null;
  cachedAuthTimestamp = 0;
  clearCookieCache();
};

/**
 * Set tokens (legacy function - tokens now stored in cookies)
 * @param {string} _accessToken - Access token (unused, kept for compatibility)
 * @param {string} [_refreshToken] - Refresh token (unused, kept for compatibility)
 * @description Legacy function - tokens are now stored in cookies, not localStorage
 */
export const setTokens = (_accessToken: string, _refreshToken?: string): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

/**
 * Clear all tokens and session data
 * @description Clears localStorage, sessionStorage, cookies, and auth cache
 */
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

// ✅ Refresh token state with queue limits
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v?: any) => void; reject: (e?: any) => void }> = [];

/**
 * Process queued requests after token refresh
 * @param {AxiosError | null} error - Error if refresh failed
 * @param {string | null} [token] - New token if refresh succeeded
 */
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// ✅ Response cache with improved cleanup
const responseCache = new Map<string, { data: any; ts: number }>();

// ✅ Periodic cleanup for response cache
if (typeof window !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    const entries = [...responseCache.entries()];
    
    // ✅ Remove expired entries
    entries.forEach(([key, value]) => {
      if (now - value.ts > CACHE_TTL) {
        responseCache.delete(key);
      }
    });
    
    // ✅ If still too large, remove oldest
    if (responseCache.size > MAX_CACHE_SIZE) {
      const sorted = entries
        .filter(([_, value]) => now - value.ts <= CACHE_TTL)
        .sort((a, b) => a[1].ts - b[1].ts);
      
      const toRemove = sorted.slice(0, responseCache.size - CACHE_CLEANUP_THRESHOLD);
      toRemove.forEach(([key]) => responseCache.delete(key));
    }
  }, 30000); // ✅ Cleanup every 30 seconds
}

/**
 * Get cache key for request
 * @param {InternalAxiosRequestConfig} config - Axios request config
 * @returns {string | null} Cache key or null if not cacheable
 * @description Only GET requests are cacheable, excludes auth endpoints
 */
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
      // ✅ Improved cache cleanup - more aggressive
      if (responseCache.size > CACHE_CLEANUP_THRESHOLD) {
        const entries = [...responseCache.entries()].sort((a, b) => a[1].ts - b[1].ts);
        // ✅ Remove more entries when threshold is reached
        const toRemove = Math.min(10, entries.length - (CACHE_CLEANUP_THRESHOLD - 10));
        for (let i = 0; i < toRemove; i++) {
          responseCache.delete(entries[i][0]);
        }
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

    // 🔴 DEBUG BREAKPOINT 1: Kiểm tra khi nhận 401 error
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

        // ✅ Queue if already refreshing with timeout và size limit
        if (isRefreshing) {
          // ✅ Check queue size
          if (failedQueue.length >= MAX_QUEUE_SIZE) {
            return Promise.reject(new Error("Too many queued requests"));
          }
          
          return new Promise((resolve, reject) => {
            // ✅ Add timeout to queued requests
            const timeoutId = setTimeout(() => {
              reject(new Error("Request timeout - token refresh taking too long"));
            }, QUEUE_TIMEOUT);
            
            failedQueue.push({ 
              resolve: (value) => {
                clearTimeout(timeoutId);
                resolve(value);
              }, 
              reject: (error) => {
                clearTimeout(timeoutId);
                reject(error);
              }
            });
          })
            .then(() => {
              if (originalRequest.headers) delete originalRequest.headers.Authorization;
              clearAuthCache();
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        // Start refresh
        // 🔴 DEBUG BREAKPOINT 2: Bắt đầu refresh token
        isRefreshing = true;
        if (isDev) console.log("[API] Refreshing token...");

        try {
          // 🔴 DEBUG BREAKPOINT 3: Gọi API refresh
          const response = await axios.post(
            "/api-proxy/auth/refresh",
            {},
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            },
          );

          // 🔴 DEBUG BREAKPOINT 4: Nhận response từ refresh - Kiểm tra accessToken
          const accessToken =
            response.data?.access_token || response.data?.data?.access_token || response.data?.accessToken || response.data?.cookies?._at?.value;

          if (!accessToken) throw new Error("No access token received from server");

          // Set cookies from response body (fallback for proxy issues)
          // 🔴 DEBUG BREAKPOINT 5: Kiểm tra cookies từ response
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
          // 🔴 DEBUG BREAKPOINT 6: Xử lý lỗi refresh
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

/**
 * Get cached response for a request
 * @param {string} url - Request URL
 * @param {any} [params] - Request parameters
 * @returns {any | null} Cached response data or null if not found/expired
 */
/**
 * Get cached response for a URL
 * @param {string} url - Request URL
 * @param {any} params - Optional request parameters
 * @returns {any | null} Cached response data or null if not found/expired
 * @description Retrieves cached GET response if available and not expired
 */
export const getCachedResponse = (url: string, params?: any): any | null => {
  const key = params ? `${url}?${JSON.stringify(params)}` : `${url}?`;
  const cached = responseCache.get(key);
  return cached && Date.now() - cached.ts < CACHE_TTL ? cached.data : null;
};

/**
 * Clear all cached responses
 * @description Clears the entire response cache
 */
export const clearResponseCache = (): void => responseCache.clear();

/**
 * Clear cached responses matching a pattern
 * @param {string | RegExp} pattern - Pattern to match against cache keys
 * @description Clears cache entries whose keys match the pattern
 * @example
 * ```typescript
 * clearCacheByPattern('/users'); // Clear all user-related cache
 * clearCacheByPattern(/\/classes\/\d+/); // Clear all class detail cache
 * ```
 */
export const clearCacheByPattern = (pattern: string | RegExp): void => {
  [...responseCache.keys()].forEach((key) => {
    if ((typeof pattern === "string" && key.includes(pattern)) || (pattern instanceof RegExp && pattern.test(key))) {
      responseCache.delete(key);
    }
  });
};

export default apiClient;
