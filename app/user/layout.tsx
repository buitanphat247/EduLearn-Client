import { cookies } from "next/headers";
import UserLayoutClient from "./UserLayoutClient";
import { decryptCookie } from "@/lib/utils/server-cookie-decrypt";

async function getInitialUserData() {
  try {
    const cookieStore = await cookies();
    // Đọc cookie mới với tên đã đổi (_u)
    const userCookie = cookieStore.get("_u");

    if (userCookie?.value) {
      try {
        // Giải mã cookie
        const decryptedUser = decryptCookie(userCookie.value);
        const userData = JSON.parse(decryptedUser);
        return {
          username: userData.username || null,
          role_name: userData.role_name || userData.role?.role_name || null,
          avatar: userData.avatar || null,
        };
      } catch (error) {
        console.error("Error decrypting/parsing user cookie:", error);
      }
    }
  } catch (error) {
    console.error("Error reading server cookie:", error);
  }

  return null;
}

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const initialUserData = await getInitialUserData();

  return <UserLayoutClient initialUserData={initialUserData}>{children}</UserLayoutClient>;
}
