import { cookies } from "next/headers";
import { decryptCookie } from "./server-cookie-decrypt";

export interface AuthState {
  authenticated: boolean;
  userData: {
    user_id: number | string;
    username: string;
    fullname: string;
    email: string;
    phone: string;
    avatar: string;
    role_id?: number;
    role?: {
      role_id: number;
      role_name: string;
      created_at: string;
      updated_at: string;
    };
  } | null;
}

export async function getServerAuthState(): Promise<AuthState> {
  const NOT_AUTHENTICATED: AuthState = { authenticated: false, userData: null };

  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("_u");
    const tokenCookie = cookieStore.get("_at");

    // Cả 2 cookie phải tồn tại và có giá trị
    if (!userCookie?.value || !tokenCookie?.value) {
      return NOT_AUTHENTICATED;
    }

    // Giải mã cookie user trên server (cùng key với backend)
    const decryptedUser = decryptCookie(userCookie.value);
    const userData = JSON.parse(decryptedUser);

    // Validate dữ liệu tối thiểu
    if (!userData || (!userData.user_id && !userData.userId)) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[SSR Auth] Decrypted user data invalid:", userData);
      }
      return NOT_AUTHENTICATED;
    }

    return {
      authenticated: true,
      userData,
    };
  } catch (error) {
    // Chỉ log warning ở dev mode (vì đây là trường hợp bình thường khi chưa đăng nhập hoặc cookie hết hạn)
    if (process.env.NODE_ENV === "development") {
      console.warn("[SSR Auth] Cookie decrypt failed:", error instanceof Error ? error.message : "Unknown");
    }
    return NOT_AUTHENTICATED;
  }
}
