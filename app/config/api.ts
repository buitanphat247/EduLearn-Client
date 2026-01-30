import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getCookie, clearCookieCache } from "@/lib/utils/cookies";

const getBaseURL = (): string => {
  if (typeof window !== "undefined") {
    return "/api-proxy";
  }
  
  const envURL = process.env.NEXT_PUBLIC_API_URL;
  
  if (envURL && envURL.trim() !== "") {
    try {
      new URL(envURL);
      return envURL;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("NEXT_PUBLIC_API_URL không hợp lệ, sử dụng URL mặc định:", envURL);
      }
    }
  }
  
  return "http://localhost:1611/api";
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  // Lưu ý: Với same-origin requests, browser vẫn tự động gửi cookie
  // mặc dù withCredentials: false. Đây là hành vi mặc định của browser.
  // Backend sẽ tự động đọc và giải mã cookie _at và _u khi nhận request
  // Cần withCredentials: true để gửi cookie lên backend
  withCredentials: true,
});

// Cache Authorization header để tránh parse cookie nhiều lần
let cachedAuthHeader: string | null = null;
let cachedAuthTimestamp: number = 0;
const AUTH_CACHE_DURATION = 1000; // 1 giây cache

/**
 * Get Authorization header from cookie _at (cached)
 */
const getCachedAuthHeader = (): string | null => {
  if (typeof window === "undefined") return null;
  
  const now = Date.now();
  // Chỉ cache trong 1 giây để đảm bảo token mới được cập nhật
  if (cachedAuthHeader && now - cachedAuthTimestamp < AUTH_CACHE_DURATION) {
    return cachedAuthHeader;
  }
  
  // Sử dụng getCookie từ cookies.ts (đã có cache)
  const atCookie = getCookie('_at');
  if (atCookie) {
    const authHeader = `Bearer ${atCookie}`;
    cachedAuthHeader = authHeader;
    cachedAuthTimestamp = now;
    return authHeader;
  }
  
  cachedAuthHeader = null;
  return null;
};

/**
 * Clear auth cache (dùng khi token thay đổi)
 * QUAN TRỌNG: Phải clear cả cookie cache để getCookie('_at') trả về giá trị mới
 */
export const clearAuthCache = (): void => {
  cachedAuthHeader = null;
  cachedAuthTimestamp = 0;
  // QUAN TRỌNG: Clear cookie cache để getCookie trả về cookies mới từ document.cookie
  clearCookieCache();
  console.log('[Frontend API] Cleared all auth and cookie caches');
};

export const setTokens = (accessToken: string, refreshToken?: string): void => {
  // KHÔNG lưu vào localStorage nữa
  // Tất cả thông tin được lưu trong cookie đã mã hóa từ backend
  // Chỉ cần xóa localStorage cũ nếu có
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const clearTokens = (): void => {
  if (typeof window === "undefined") return;
  
  console.log('[Frontend API] Clearing all tokens and caches...');
  
  // Xóa các keys cũ trong localStorage (nếu có)
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  
  // Xóa sessionStorage cache
  try {
    sessionStorage.removeItem("edulearn_user_id");
    sessionStorage.removeItem("edulearn_user_data");
  } catch (e) {
    // Ignore
  }
  
  // Xóa cookies (tên cookie đã đổi thành _at và _u để khó đoán)
  document.cookie = "_at=; path=/; max-age=0";
  document.cookie = "_u=; path=/; max-age=0";
  
  // Clear caches
  clearAuthCache();
  console.log('[Frontend API] All tokens and caches cleared');
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response cache cho GET requests (tránh gọi API nhiều lần với cùng params)
const responseCache = new Map<string, { data: any; timestamp: number }>();
const RESPONSE_CACHE_DURATION = 30 * 1000; // 30 giây cache cho GET requests

const getCacheKey = (config: InternalAxiosRequestConfig): string | null => {
  // Chỉ cache GET requests, không cache auth endpoints
  if (config.method?.toLowerCase() !== 'get') return null;
  const url = config.url || '';
  // Không cache auth endpoints vì cần real-time data
  if (url.includes('/auth/')) return null;
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${url}?${params}`;
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { _retry?: boolean }) => {
    // QUAN TRỌNG: 
    // 1. Không set Authorization header nếu request đã retry (sau refresh token)
    //    Vì lúc này cookies mới đã được set, để browser gửi cookies mới
    // 2. Không set Authorization cho refresh endpoint
    
    const isRefreshRequest = config.url?.includes('/auth/refresh');
    const isRetryRequest = config._retry === true;
    
    // Nếu đã retry hoặc là refresh request, KHÔNG set Authorization header
    // Browser sẽ tự động gửi cookies mới (_at và _u) với withCredentials: true
    if (!isRefreshRequest && !isRetryRequest) {
      const authHeader = getCachedAuthHeader();
      if (authHeader) {
        config.headers.Authorization = authHeader;
      }
    } else if (isRetryRequest) {
      // Đã retry rồi, đảm bảo không có Authorization header cũ
      // Để backend đọc từ cookies mới
      if (config.headers?.Authorization) {
        console.log('[Frontend API] Request interceptor: Removing stale Authorization from retry request');
        delete config.headers.Authorization;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    // Cache GET responses (tránh parse lại response data)
    const cacheKey = getCacheKey(response.config);
    if (cacheKey) {
      responseCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
      
      // Cleanup old cache entries (giữ tối đa 50 entries)
      if (responseCache.size > 50) {
        const entries = Array.from(responseCache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        // Xóa 10 entries cũ nhất
        for (let i = 0; i < 10 && i < entries.length; i++) {
          responseCache.delete(entries[i][0]);
        }
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = (data as any)?.message || "Có lỗi xảy ra";

      switch (status) {
        case 401:
          // DEBUG: Log chi tiết 401 response
          console.log('[Frontend API] ========== 401 ERROR ==========');
          console.log('[Frontend API] URL:', originalRequest?.url);
          console.log('[Frontend API] Response data:', JSON.stringify(data));
          console.log('[Frontend API] Response data type:', typeof data);
          
          // Extract error code từ response
          const errorCode = (data as any)?.code;
          console.log('[Frontend API] Error code:', errorCode);
          console.log('[Frontend API] Error message:', errorMessage);
          console.log('[Frontend API] _retry flag:', originalRequest?._retry);
          
          const isAuthRequest = originalRequest?.url?.includes("/auth/signin") || 
                                originalRequest?.url?.includes("/auth/signup");
          
          // Nếu là request đăng nhập/đăng ký, reject ngay
          if (isAuthRequest) {
            console.log('[Frontend API] Auth request, rejecting...');
            return Promise.reject({
              ...error,
              message: errorMessage || "Đăng nhập thất bại",
              code: errorCode,
            });
          }

          // Xử lý các error codes từ backend
          if (errorCode === 'REFRESH_TOKEN_EXPIRED' || 
              errorCode === 'INVALID_REFRESH_TOKEN' || 
              errorCode === 'USER_BANNED') {
            // Logout ngay lập tức, không retry
            console.log('[Frontend API] ❌ Critical error code, logging out:', errorCode);
            clearTokens();
            if (typeof window !== "undefined") {
              window.location.href = "/auth";
            }
            processQueue(error, null);
            isRefreshing = false;
            return Promise.reject({
              ...error,
              code: errorCode,
              message: errorMessage,
            });
          }

          // Xử lý ACCESS_TOKEN_EXPIRED - chỉ refresh khi chưa retry
          console.log('[Frontend API] Checking if should refresh...');
          console.log('[Frontend API] - errorCode === ACCESS_TOKEN_EXPIRED:', errorCode === 'ACCESS_TOKEN_EXPIRED');
          console.log('[Frontend API] - !errorCode:', !errorCode);
          console.log('[Frontend API] - Should trigger refresh:', errorCode === 'ACCESS_TOKEN_EXPIRED' || !errorCode);
          
          if (errorCode === 'ACCESS_TOKEN_EXPIRED' || !errorCode) {
            if (originalRequest && !originalRequest._retry) {
              console.log('[Frontend API] ✅ Will trigger refresh token...');
              originalRequest._retry = true;

              // Nếu đang refresh, queue request
              if (isRefreshing) {
                console.log('[Frontend API] Already refreshing, queueing request...');
                return new Promise((resolve, reject) => {
                  failedQueue.push({ resolve, reject });
                })
                  .then((token) => {
                    // Sau khi refresh, cookies mới đã được set
                    // XÓA Authorization header để dùng cookies mới thay vì token cũ
                    if (originalRequest.headers) {
                      delete originalRequest.headers.Authorization;
                    }
                    // Clear cache để dùng cookies mới
                    clearAuthCache();
                    // Retry request - browser sẽ tự động gửi cookies mới
                    return apiClient(originalRequest);
                  })
                  .catch((err) => {
                    return Promise.reject(err);
                  });
              }

              // Bắt đầu refresh token
              isRefreshing = true;
              console.log('[Frontend API] 🔄 Starting refresh token...');
              console.log('[Frontend API] Current cookies:', document.cookie.substring(0, 100) + '...');
              
              // Refresh token được lưu trong cookie HttpOnly, không cần lấy từ localStorage
              // Backend sẽ đọc từ cookie, fallback về body nếu không có cookie
              try {
                // Refresh endpoint: Backend tự động lấy refreshToken từ DB dựa trên user_id từ accessToken
                console.log('[Frontend API] Calling /api-proxy/auth/refresh...');
                const response = await axios.post(
                  "/api-proxy/auth/refresh",
                  {}, // Không cần gửi refresh_token, backend tự động lấy từ DB
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                    withCredentials: true, // Cần để gửi cookie accessToken
                  }
                );

                let accessToken: string | undefined;

                if (response.data?.access_token) {
                  accessToken = response.data.access_token;
                } else if (response.data?.data?.access_token) {
                  accessToken = response.data.data.access_token;
                } else if (response.data?.accessToken) {
                  accessToken = response.data.accessToken;
                }

                if (accessToken) {
                  console.log('[Frontend API] ✅ Refresh token successful, got new accessToken');
                  console.log('[Frontend API] New accessToken length:', accessToken.length);
                  
                  // QUAN TRỌNG: Set cookies từ response body (không dựa vào Set-Cookie headers)
                  // Vì Set-Cookie headers có thể không được forward đúng qua Next.js API proxy
                  const cookies = response.data?.cookies;
                  if (cookies) {
                    console.log('[Frontend API] Setting cookies from response body...');
                    
                    // Set cookie _at
                    if (cookies._at) {
                      const atExpires = new Date(Date.now() + cookies._at.maxAge);
                      document.cookie = `_at=${encodeURIComponent(cookies._at.value)}; path=/; expires=${atExpires.toUTCString()}; SameSite=Lax`;
                      console.log('[Frontend API] ✅ Cookie _at set from response body');
                      console.log('[Frontend API] - Cookie _at expires:', atExpires.toISOString());
                    }
                    
                    // Set cookie _u
                    if (cookies._u) {
                      const uExpires = new Date(Date.now() + cookies._u.maxAge);
                      document.cookie = `_u=${encodeURIComponent(cookies._u.value)}; path=/; expires=${uExpires.toUTCString()}; SameSite=Lax`;
                      console.log('[Frontend API] ✅ Cookie _u set from response body');
                      console.log('[Frontend API] - Cookie _u expires:', uExpires.toISOString());
                    }
                  } else {
                    console.warn('[Frontend API] ⚠️ No cookies in response body, relying on Set-Cookie headers');
                  }
                  
                  // Clear auth cache để dùng token mới từ cookie
                  clearAuthCache();
                  console.log('[Frontend API] Cleared auth cache');
                  
                  // Debug: Check cookies sau khi set
                  const currentCookies = document.cookie;
                  console.log('[Frontend API] Current cookies after refresh:');
                  console.log('[Frontend API] - Cookie _at exists:', currentCookies.includes('_at='));
                  console.log('[Frontend API] - Cookie _u exists:', currentCookies.includes('_u='));
                  
                  // Verify cookies were set correctly
                  const atCookie = getCookie('_at');
                  const uCookie = getCookie('_u');
                  console.log('[Frontend API] - Cookie _at length (from getCookie):', atCookie?.length || 0);
                  console.log('[Frontend API] - Cookie _u length (from getCookie):', uCookie?.length || 0);

                  // XÓA Authorization header để browser dùng cookies mới
                  if (originalRequest.headers) {
                    delete originalRequest.headers.Authorization;
                    console.log('[Frontend API] Removed Authorization header from retry request');
                  }

                  // Process queue
                  processQueue(null, accessToken);
                  isRefreshing = false;
                  console.log('[Frontend API] Retrying original request to:', originalRequest.url);

                  // Retry request - sẽ dùng cookies mới đã được set
                  return apiClient(originalRequest);
                } else {
                  console.error('[Frontend API] ❌ No accessToken in refresh response');
                  console.error('[Frontend API] Response data:', response.data);
                  throw new Error("Không nhận được access token mới");
                }
              } catch (refreshError: any) {
                // Kiểm tra error code từ refresh response
                const refreshErrorCode = refreshError?.response?.data?.code;
                
                // Nếu refresh token hết hạn hoặc không hợp lệ, logout ngay
                if (refreshErrorCode === 'REFRESH_TOKEN_EXPIRED' || 
                    refreshErrorCode === 'INVALID_REFRESH_TOKEN' ||
                    refreshErrorCode === 'USER_BANNED') {
                  clearTokens();
                  processQueue(refreshError as AxiosError, null);
                  isRefreshing = false;

                  if (typeof window !== "undefined") {
                    window.location.href = "/auth";
                  }

                  return Promise.reject(refreshError);
                }

                // Các lỗi khác
                clearTokens();
                processQueue(refreshError as AxiosError, null);
                isRefreshing = false;

                if (typeof window !== "undefined") {
                  window.location.href = "/auth";
                }

                return Promise.reject(refreshError);
              }
            } else {
              // Đã retry rồi nhưng vẫn lỗi 401
              // Debug thông tin để hiểu tại sao retry vẫn fail
              console.error('[Frontend API] ❌ Retry request still got 401!');
              console.error('[Frontend API] - Error code:', errorCode);
              console.error('[Frontend API] - Error message:', errorMessage);
              console.error('[Frontend API] - Request URL:', originalRequest?.url);
              console.error('[Frontend API] - Current cookies:', document.cookie.length > 100 ? document.cookie.substring(0, 100) + '...' : document.cookie);
              
              // Chỉ logout nếu error code là những lỗi không thể recover
              if (errorCode === 'REFRESH_TOKEN_EXPIRED' || 
                  errorCode === 'INVALID_REFRESH_TOKEN' || 
                  errorCode === 'USER_BANNED' ||
                  errorCode === 'ACCESS_TOKEN_EXPIRED') {
                console.error('[Frontend API] Critical error after retry, logging out...');
                clearTokens();
                if (typeof window !== "undefined") {
                  window.location.href = "/auth";
                }
              }
              // Không logout với các error codes khác, chỉ reject error
              return Promise.reject(error);
            }
          }

          // Các error codes không được handle ở trên - KHÔNG tự động logout
          // Chỉ reject error để caller xử lý
          console.warn('[Frontend API] Unhandled 401 error code:', errorCode);
          return Promise.reject({
            ...error,
            code: errorCode,
            message: errorMessage,
          });

        case 403:
          if (process.env.NODE_ENV === 'development') {
            console.error("Bạn không có quyền truy cập");
          }
          return Promise.reject({
            ...error,
            message: errorMessage || "Bạn không có quyền truy cập tài nguyên này",
          });

        case 404:
          if (process.env.NODE_ENV === 'development') {
            console.error("Không tìm thấy tài nguyên");
          }
          return Promise.reject({
            ...error,
            message: errorMessage || "Không tìm thấy tài nguyên",
          });

        case 422:
          const validationErrors = (data as any)?.errors || {};
          return Promise.reject({
            ...error,
            message: errorMessage || "Dữ liệu không hợp lệ",
            errors: validationErrors,
          });

        case 429:
          if (process.env.NODE_ENV === 'development') {
            console.error("Quá nhiều requests, vui lòng thử lại sau");
          }
          return Promise.reject({
            ...error,
            message: errorMessage || "Quá nhiều requests, vui lòng thử lại sau",
          });

        case 500:
          if (process.env.NODE_ENV === 'development') {
            console.error("Lỗi server, vui lòng thử lại sau");
          }
          return Promise.reject({
            ...error,
            message: errorMessage || "Lỗi server, vui lòng thử lại sau",
          });

        case 502:
          if (process.env.NODE_ENV === 'development') {
            console.error("Lỗi kết nối đến server");
          }
          return Promise.reject({
            ...error,
            message: errorMessage || "Lỗi kết nối đến server",
          });

        case 503:
          if (process.env.NODE_ENV === 'development') {
            console.error("Dịch vụ tạm thời không khả dụng");
          }
          return Promise.reject({
            ...error,
            message: errorMessage || "Dịch vụ tạm thời không khả dụng",
          });

        case 504:
          if (process.env.NODE_ENV === 'development') {
            console.error("Request timeout");
          }
          return Promise.reject({
            ...error,
            message: errorMessage || "Request timeout, vui lòng thử lại",
          });

        default:
          if (process.env.NODE_ENV === 'development') {
            console.error(errorMessage);
          }
          return Promise.reject({
            ...error,
            message: errorMessage,
          });
      }
    } else if (error.request) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Không thể kết nối đến server");
      }
      return Promise.reject({
        ...error,
        message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
      });
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error("Lỗi khi gửi request:", error.message);
      }
      return Promise.reject({
        ...error,
        message: error.message || "Có lỗi xảy ra khi gửi request",
      });
    }
  }
);

/**
 * Get cached response (dùng để check cache trước khi gọi API)
 */
export const getCachedResponse = (url: string, params?: any): any | null => {
  const cacheKey = params ? `${url}?${JSON.stringify(params)}` : `${url}?`;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < RESPONSE_CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

/**
 * Clear response cache (dùng khi data thay đổi)
 */
export const clearResponseCache = (): void => {
  responseCache.clear();
};

/**
 * Clear specific cache entry by URL pattern
 */
export const clearCacheByPattern = (pattern: string | RegExp): void => {
  const keys = Array.from(responseCache.keys());
  keys.forEach((key) => {
    if (typeof pattern === 'string' && key.includes(pattern)) {
      responseCache.delete(key);
    } else if (pattern instanceof RegExp && pattern.test(key)) {
      responseCache.delete(key);
    }
  });
};

export default apiClient;

