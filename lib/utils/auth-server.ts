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
    role?: {
      role_id: number;
      role_name: string;
      created_at: string;
      updated_at: string;
    };
  } | null;
}

export async function getServerAuthState(): Promise<AuthState> {
  try {
    const cookieStore = await cookies();
    // Đọc cookie mới với tên đã đổi (_u và _at)
    const userCookie = cookieStore.get("_u");
    const tokenCookie = cookieStore.get("_at");
    
    if (userCookie?.value && tokenCookie?.value) {
      try {
        // Giải mã cookie user
        const decryptedUser = decryptCookie(userCookie.value);
        const userData = JSON.parse(decryptedUser);
        
        // Verify token cookie tồn tại (không cần giải mã token ở đây)
        // Token sẽ được verify khi gọi API
        
        return {
          authenticated: true,
          userData: userData,
        };
      } catch (error) {
        console.error("Error decrypting/parsing user cookie:", error);
        return {
          authenticated: false,
          userData: null,
        };
      }
    }
    
    return {
      authenticated: false,
      userData: null,
    };
  } catch (error) {
    console.error("Error reading server auth state:", error);
    return {
      authenticated: false,
      userData: null,
    };
  }
}

