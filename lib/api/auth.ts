import apiClient, { clearTokens, clearAuthCache, clearResponseCache } from "@/app/config/api";
import { clearUserCache, clearCookieCache, saveUserDataToSession } from "@/lib/utils/cookies";
import type { SignInRequest, SignInResponse, SignUpRequest, SignUpResponse } from "@/interface/auth";

/**
 * Helper function to set cookies from response body
 * Next.js rewrite doesn't forward Set-Cookie headers automatically
 */
function setCookiesFromResponse(response: any): void {
  const isDev = process.env.NODE_ENV === "development";
  const body = response.data;
  const cookies = body?.data?.cookies || body?.cookies;

  if (typeof window === "undefined" || !cookies) {
    if (isDev) console.log("[API] No cookies found in response", body);
    return;
  }

  if (isDev) console.log("[API] Setting cookies from response:", Object.keys(cookies));

  const sameSiteAttr = isDev ? "SameSite=Lax" : "SameSite=None; Secure=true";

  Object.keys(cookies).forEach((name) => {
    if (name === "_at" || name === "_u" || name === "_rt") {
      const cookieData = cookies[name];
      const value = cookieData.value || cookieData;
      const maxAge = cookieData.maxAge || 7 * 24 * 60 * 60 * 1000;
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

export const googleLogin = async (data: { token?: string; code?: string; redirect_uri?: string; device_name?: string }): Promise<SignInResponse> => {
  const isDev = process.env.NODE_ENV === "development";
  try {
    if (isDev) {
      console.log("[Google Login API] ===== START =====");
      console.log("[Google Login API] Sending to /auth/google-login:", {
        hasToken: !!data.token,
        tokenLength: data.token?.length || 0,
        hasCode: !!data.code,
        device_name: data.device_name,
      });
    }

    const response = await apiClient.post<SignInResponse>("/auth/google-login", data, {
      withCredentials: true,
    });

    if (isDev) {
      console.log("[Google Login API] Raw response status:", response.status);
      console.log("[Google Login API] Response data keys:", Object.keys(response.data || {}));
      console.log("[Google Login API] Response data:", JSON.stringify(response.data, null, 2).substring(0, 500));
    }

    // Set cookies from response body (server sends encrypted cookies in response for fallback)
    // This sets _at, _u, _rt cookies which are the ONLY source of auth state
    setCookiesFromResponse(response);

    // Cache user data in sessionStorage for fast lookup (tab-scoped, NOT persistent like localStorage)
    const responseData = response.data as any;
    const userData = responseData?.data?.user || responseData?.user;

    if (isDev) {
      console.log("[Google Login API] Extracted userData:", userData ? `user_id=${userData.user_id}` : "MISSING!");
      console.log(
        "[Google Login API] Cookies in response:",
        responseData?.data?.cookies ? Object.keys(responseData.data.cookies) : responseData?.cookies ? Object.keys(responseData.cookies) : "NONE",
      );
    }

    if (userData && typeof window !== "undefined") {
      try {
        saveUserDataToSession(userData);
        if (isDev) console.log("[Google Login API] ✅ User data cached in sessionStorage");
      } catch (e) {
        if (isDev) console.error("[Google Login API] ⚠️ Failed to cache user to session:", e);
      }
    }

    if (isDev) console.log("[Google Login API] ===== DONE =====");
    return response.data;
  } catch (error: any) {
    console.error("[Google Login API] ===== ERROR =====");
    console.error("[Google Login API] Error:", error?.message);
    console.error("[Google Login API] Error response:", error?.response?.data);
    console.error("[Google Login API] Error status:", error?.response?.status);
    const errorMessage = error?.response?.data?.message || error?.message || "Đăng nhập Google thất bại";
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
