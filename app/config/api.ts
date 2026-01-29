import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getCookie } from "@/lib/utils/cookies";

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
 */
export const clearAuthCache = (): void => {
  cachedAuthHeader = null;
  cachedAuthTimestamp = 0;
};

const setTokens = (accessToken: string, refreshToken?: string): void => {
  // KHÔNG lưu vào localStorage nữa
  // Tất cả thông tin được lưu trong cookie đã mã hóa từ backend
  // Chỉ cần xóa localStorage cũ nếu có
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const clearTokens = (): void => {
  if (typeof window === "undefined") return;
  
  // Xóa các keys cũ trong localStorage (nếu có)
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  
  // Xóa cookies (tên cookie đã đổi thành _at và _u để khó đoán)
  document.cookie = "_at=; path=/; max-age=0";
  document.cookie = "_u=; path=/; max-age=0";
  
  // Clear caches
  clearAuthCache();
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
  (config: InternalAxiosRequestConfig) => {
    // Sử dụng cached Authorization header để tránh parse cookie mỗi request
    const authHeader = getCachedAuthHeader();
    if (authHeader) {
      config.headers.Authorization = authHeader;
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
          // Extract error code từ response
          const errorCode = (data as any)?.code;
          const isAuthRequest = originalRequest?.url?.includes("/auth/signin") || 
                                originalRequest?.url?.includes("/auth/signup");
          
          // Nếu là request đăng nhập/đăng ký, reject ngay
          if (isAuthRequest) {
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
          if (errorCode === 'ACCESS_TOKEN_EXPIRED' || !errorCode) {
            if (originalRequest && !originalRequest._retry) {
              originalRequest._retry = true;

              // Nếu đang refresh, queue request
              if (isRefreshing) {
                return new Promise((resolve, reject) => {
                  failedQueue.push({ resolve, reject });
                })
                  .then((token) => {
                    if (originalRequest.headers) {
                      originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return apiClient(originalRequest);
                  })
                  .catch((err) => {
                    return Promise.reject(err);
                  });
              }

              // Bắt đầu refresh token
              isRefreshing = true;
              
              // Refresh token được lưu trong cookie HttpOnly, không cần lấy từ localStorage
              // Backend sẽ đọc từ cookie, fallback về body nếu không có cookie
              try {
                // Refresh endpoint: Backend tự động lấy refreshToken từ DB dựa trên user_id từ accessToken
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
                  // Backend đã set cookie mới rồi, không cần lưu vào localStorage
                  // Chỉ cần dùng accessToken để retry request
                  
                  // Clear auth cache để dùng token mới
                  clearAuthCache();

                  if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                  }

                  processQueue(null, accessToken);
                  isRefreshing = false;

                  return apiClient(originalRequest);
                } else {
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
              // Đã retry rồi nhưng vẫn lỗi, logout
              clearTokens();
              if (typeof window !== "undefined") {
                window.location.href = "/auth";
              }
              return Promise.reject(error);
            }
          }

          // Các error codes khác - logout
          clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/auth";
          }
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

export { getAccessToken, getRefreshToken, setTokens, clearTokens };
export default apiClient;

