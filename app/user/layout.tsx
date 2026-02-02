import { cookies } from "next/headers";
import UserLayoutClient from "./UserLayoutClient";
import { decryptCookie } from "@/lib/utils/server-cookie-decrypt";
import RouteErrorBoundary from "@/app/components/common/RouteErrorBoundary";

async function getInitialUserData() {
  try {
    const cookieStore = await cookies();
    // Đọc cookie mới với tên đã đổi (_u)
    const userCookie = cookieStore.get("_u");

    if (userCookie?.value) {
      try {
        // ✅ Giải mã cookie
        const decryptedUser = decryptCookie(userCookie.value);
        const userData = JSON.parse(decryptedUser);
        
        // ✅ Validate decrypted data to prevent XSS
        if (typeof userData !== 'object' || userData === null) {
          console.error("Invalid user data format from cookie");
          return null;
        }

        // ✅ Sanitize và validate fields
        const username = typeof userData.username === 'string' ? userData.username : null;
        const role_name = typeof userData.role_name === 'string' 
          ? userData.role_name 
          : (typeof userData.role?.role_name === 'string' ? userData.role.role_name : null);
        const avatar = typeof userData.avatar === 'string' ? userData.avatar : null;

        return {
          username,
          role_name,
          avatar,
        };
      } catch (error) {
        // ✅ Log error but don't expose sensitive information
        console.error("Error decrypting/parsing user cookie:", error instanceof Error ? error.message : 'Unknown error');
        return null;
      }
    }
  } catch (error) {
    console.error("Error reading server cookie:", error instanceof Error ? error.message : 'Unknown error');
  }

  return null;
}

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const initialUserData = await getInitialUserData();

  return (
    <RouteErrorBoundary routeName="user">
      <UserLayoutClient initialUserData={initialUserData}>{children}</UserLayoutClient>
    </RouteErrorBoundary>
  );
}
