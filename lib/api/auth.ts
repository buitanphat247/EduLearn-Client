import apiClient, { clearTokens, clearAuthCache, clearResponseCache } from "@/app/config/api";
import { clearUserCache, clearCookieCache, saveUserDataToSession } from "@/lib/utils/cookies";
import type { SignInRequest, SignInResponse, SignUpRequest, SignUpResponse } from "@/interface/auth";

export const signIn = async (credentials: SignInRequest): Promise<SignInResponse> => {
  try {
    const response = await apiClient.post<SignInResponse>("/auth/signin", credentials, {
      withCredentials: true, // Cần để gửi và nhận cookie
    });
    
    // Backend đã mã hóa và set accessToken và user vào cookie rồi
    // KHÔNG lưu vào localStorage nữa - chỉ dùng cookie đã mã hóa
    // Tất cả thông tin sẽ được đọc từ cookie ở server-side
    
    return response.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Đăng nhập thất bại";
    throw new Error(errorMessage);
  }
};

export const signUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
  try {
    const response = await apiClient.post<SignUpResponse>("/auth/signup", data, {
      withCredentials: true, // Cần để gửi và nhận cookie
    });
    
    // Backend đã mã hóa và set accessToken và user vào cookie rồi
    // KHÔNG lưu vào localStorage nữa - chỉ dùng cookie đã mã hóa
    // Tất cả thông tin sẽ được đọc từ cookie ở server-side
    
    return response.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Đăng ký thất bại";
    throw new Error(errorMessage);
  }
};

export  const signOut = async (): Promise<void> => {
  try {
    await apiClient.post("/auth/signout", {}, {
      withCredentials: true, // Cần để gửi cookie _at và _u
    });
  } catch (error: any) {
    // Logout vẫn tiếp tục ngay cả khi API call fail
    // Backend có thể đã xóa token rồi, hoặc network error
    if (process.env.NODE_ENV === 'development') {
      const status = error?.response?.status;
      if (status === 400) {
        console.error("Dữ liệu không hợp lệ khi đăng xuất");
      } else if (status === 401) {
        console.error("Token không hợp lệ khi đăng xuất");
      } else if (error?.message) {
        console.error("Error signing out:", error.message);
      }
    }
  } finally {
    // Luôn clear tokens và cache, kể cả khi API call fail
    clearTokens();
    clearUserCache();
    clearCookieCache();
    clearAuthCache();
    clearResponseCache(); // Clear tất cả API response cache
    
    // ✅ Clear localStorage safely with error handling
    if (typeof window !== "undefined") {
      try {
        // Chỉ xóa các keys liên quan đến authentication
        // Giữ lại theme và các settings khác
        const theme = localStorage.getItem("theme");
        localStorage.clear();
        // Khôi phục theme sau khi clear
        if (theme) {
          localStorage.setItem("theme", theme);
        }
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
      
      // ✅ Use setTimeout to allow async operations to complete
      // Or use router for better control (if available)
      setTimeout(() => {
        try {
          window.location.replace("/auth");
        } catch (error) {
          console.error("Error redirecting to auth page:", error);
          // Fallback: try window.location.href
          try {
            window.location.href = "/auth";
          } catch (fallbackError) {
            console.error("Fallback redirect also failed:", fallbackError);
          }
        }
      }, 100);
    }
  }
};

export interface ProfileResponse {
  status: boolean;
  message: string;
  data: {
    user_id: number | string;
    username: string;
    fullname: string;
    email: string;
    phone: string;
    avatar: string;
    status: string;
    role_id?: number;
    role?: {
      role_id: number;
      role_name: string;
      created_at: string;
      updated_at: string;
    };
    created_at: string;
    updated_at: string;
  };
  statusCode: number;
  timestamp: string;
}

export const getProfile = async (): Promise<ProfileResponse['data']> => {
  try {
    const response = await apiClient.get<ProfileResponse>("/auth/profile", {
      withCredentials: true, // Cần để gửi cookie _u và _at
    });
    
    // Response từ backend đã được ResponseInterceptor wrap:
    // { status, message, data: user, statusCode, timestamp }
    if (response.data.status && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || "Không thể lấy thông tin profile");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy thông tin profile";
    throw new Error(errorMessage);
  }
};
