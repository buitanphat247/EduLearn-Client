import apiClient, { clearTokens, clearAuthCache, clearResponseCache } from "@/app/config/api";
import { clearUserCache, clearCookieCache, saveUserDataToSession } from "@/lib/utils/cookies";
import type { SignInRequest, SignInResponse, SignUpRequest, SignUpResponse } from "@/interface/auth";

/**
 * Helper function to set cookies from response body
 * Next.js rewrite doesn't forward Set-Cookie headers automatically
 */
function setCookiesFromResponse(response: any): void {
  if (typeof window === "undefined" || !response.data?.cookies) return;
  
  const isDev = process.env.NODE_ENV === "development";
  const sameSiteAttr = isDev ? 'SameSite=Lax' : 'SameSite=None; Secure=true';
  const cookies = response.data.cookies;
  
  Object.keys(cookies).forEach((name) => {
    if (name === '_at' || name === '_u' || name === '_rt') {
      const cookieData = cookies[name];
      const value = cookieData.value || cookieData;
      const maxAge = cookieData.maxAge || (7 * 24 * 60 * 60 * 1000);
      const expDate = new Date(Date.now() + maxAge);
      document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expDate.toUTCString()}; ${sameSiteAttr}`;
    }
  });
}

export const signIn = async (credentials: SignInRequest): Promise<SignInResponse> => {
  try {
    const response = await apiClient.post<SignInResponse>("/auth/signin", credentials, {
      withCredentials: true,
    });

    setCookiesFromResponse(response);
    return response.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Đăng nhập thất bại";
    throw new Error(errorMessage);
  }
};

export const signUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
  try {
    const response = await apiClient.post<SignUpResponse>("/auth/signup", data, {
      withCredentials: true,
    });

    setCookiesFromResponse(response);
    return response.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Đăng ký thất bại";
    throw new Error(errorMessage);
  }
};

const clearAuthState = () => {
  clearTokens();
  clearUserCache();
  clearCookieCache();
  clearAuthCache();
  clearResponseCache();
  if (typeof window !== "undefined") {
    try {
      const theme = localStorage.getItem("theme");
      localStorage.clear();
      if (theme) {
        localStorage.setItem("theme", theme);
      }
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await apiClient.post("/auth/signout", {}, { withCredentials: true });
  } catch (error: any) {
    // Continue logout even if API call fails
  } finally {
    clearAuthState();
  }
};

/** Đăng xuất khỏi mọi thiết bị: vô hiệu hóa tất cả refresh token, xóa cookie/localStorage rồi redirect về trang đăng nhập */
export const signOutAllDevices = async (): Promise<void> => {
  try {
    await apiClient.post("/auth/signout-all", {}, { withCredentials: true });
  } catch (error: any) {
    // Vẫn xóa state local dù API lỗi (token hết hạn, mạng...)
  } finally {
    clearAuthState();
  }
  if (typeof window !== "undefined") {
    window.location.href = "/auth";
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

export const getProfile = async (): Promise<ProfileResponse["data"]> => {
  try {
    const response = await apiClient.get<ProfileResponse>("/auth/profile", {
      withCredentials: true,
    });

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Không thể lấy thông tin profile");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy thông tin profile";
    throw new Error(errorMessage);
  }
};
