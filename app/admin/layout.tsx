import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

import AdminLayoutClient from "./AdminLayoutClient";
import { decryptCookie } from "@/lib/utils/server-cookie-decrypt";
import RouteErrorBoundary from "@/app/components/common/RouteErrorBoundary";

async function getInitialUserData() {
  try {
    const cookieStore = await cookies();
    // Đọc cookie mới với tên đã đổi (_u)
    const userCookie = cookieStore.get("_u");

    if (!userCookie?.value) {
      return null;
    }

    try {
      // Giải mã cookie
      const decryptedUser = decryptCookie(userCookie.value);
      const userData = JSON.parse(decryptedUser);

      // Validate required fields
      if (!userData || typeof userData !== 'object') {
        console.error("Invalid user data structure");
        return null;
      }

      return {
        username: userData.username || null,
        role_name: userData.role_name || userData.role?.role_name || null,
        avatar: userData.avatar || null,
      };
    } catch (decryptError) {
      console.error("Error decrypting/parsing user cookie:", decryptError);
      // In production, consider logging to monitoring service
      return null;
    }
  } catch (error) {
    console.error("Error reading server cookie:", error);
    return null;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const initialUserData = await getInitialUserData();

  return (
    <RouteErrorBoundary routeName="admin">
      <AdminLayoutClient initialUserData={initialUserData}>{children}</AdminLayoutClient>
    </RouteErrorBoundary>
  );
}
