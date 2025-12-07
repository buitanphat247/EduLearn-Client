import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

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
      console.warn("NEXT_PUBLIC_API_URL không hợp lệ, sử dụng URL mặc định:", envURL);
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
});

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

const setTokens = (accessToken: string, refreshToken?: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  
  document.cookie = `accessToken=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  if (refreshToken) {
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  }
};

const clearTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("user");
  
  document.cookie = "accessToken=; path=/; max-age=0";
  document.cookie = "refreshToken=; path=/; max-age=0";
  document.cookie = "user=; path=/; max-age=0";
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

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = (data as any)?.message || "Có lỗi xảy ra";

      switch (status) {
        case 401:
          const isAuthRequest = originalRequest?.url?.includes("/auth/signin") || originalRequest?.url?.includes("/auth/signup");
          
          if (isAuthRequest) {
            return Promise.reject({
              ...error,
              message: errorMessage || "Đăng nhập thất bại",
            });
          }

          if (originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

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

            isRefreshing = true;
            const refreshToken = getRefreshToken();

            if (!refreshToken) {
              clearTokens();
              if (typeof window !== "undefined") {
                window.location.href = "/auth";
              }
              processQueue(error, null);
              isRefreshing = false;
              return Promise.reject(error);
            }

            try {
              const response = await axios.post(
                "/api-proxy/auth/refresh",
                { refresh_token: refreshToken },
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
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
                setTokens(accessToken, refreshToken);

                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }

                processQueue(null, accessToken);
                isRefreshing = false;

                return apiClient(originalRequest);
              } else {
                throw new Error("Không nhận được access token mới");
              }
            } catch (refreshError) {
              clearTokens();
              processQueue(refreshError as AxiosError, null);
              isRefreshing = false;

              if (typeof window !== "undefined") {
                window.location.href = "/auth";
              }

              return Promise.reject(refreshError);
            }
          } else {
            const isAuthRequest = originalRequest?.url?.includes("/auth/signin") || originalRequest?.url?.includes("/auth/signup");
            
            if (!isAuthRequest) {
              clearTokens();
              if (typeof window !== "undefined") {
                window.location.href = "/auth";
              }
            }
            return Promise.reject(error);
          }

        case 403:
          console.error("Bạn không có quyền truy cập");
          return Promise.reject({
            ...error,
            message: errorMessage || "Bạn không có quyền truy cập tài nguyên này",
          });

        case 404:
          console.error("Không tìm thấy tài nguyên");
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
          console.error("Quá nhiều requests, vui lòng thử lại sau");
          return Promise.reject({
            ...error,
            message: errorMessage || "Quá nhiều requests, vui lòng thử lại sau",
          });

        case 500:
          console.error("Lỗi server, vui lòng thử lại sau");
          return Promise.reject({
            ...error,
            message: errorMessage || "Lỗi server, vui lòng thử lại sau",
          });

        case 502:
          console.error("Lỗi kết nối đến server");
          return Promise.reject({
            ...error,
            message: errorMessage || "Lỗi kết nối đến server",
          });

        case 503:
          console.error("Dịch vụ tạm thời không khả dụng");
          return Promise.reject({
            ...error,
            message: errorMessage || "Dịch vụ tạm thời không khả dụng",
          });

        case 504:
          console.error("Request timeout");
          return Promise.reject({
            ...error,
            message: errorMessage || "Request timeout, vui lòng thử lại",
          });

        default:
          console.error(errorMessage);
          return Promise.reject({
            ...error,
            message: errorMessage,
          });
      }
    } else if (error.request) {
      console.error("Không thể kết nối đến server");
      return Promise.reject({
        ...error,
        message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
      });
    } else {
      console.error("Lỗi khi gửi request:", error.message);
      return Promise.reject({
        ...error,
        message: error.message || "Có lỗi xảy ra khi gửi request",
      });
    }
  }
);

export { getAccessToken, getRefreshToken, setTokens, clearTokens };
export default apiClient;

