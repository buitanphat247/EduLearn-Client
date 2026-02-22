import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import UserLayoutClient from "./UserLayoutClient";
import { decryptCookie } from "@/lib/utils/server-cookie-decrypt";
import RouteErrorBoundary from "@/app/components/common/RouteErrorBoundary";
import { FEATURES } from "@/app/config/features";

async function getInitialUserData() {
  try {
    const cookieStore = await cookies();
    // Ensure cookieStore exists
    if (!cookieStore) {
      console.error("Cookie store is undefined");
      return null;
    }

    // Đọc cookie mới với tên đã đổi (_u)
    const userCookie = cookieStore.get("_u");

    if (userCookie?.value) {
      try {
        // ✅ Giải mã cookie
        const decryptedUser = decryptCookie(userCookie.value);
        const userData = JSON.parse(decryptedUser);
        console.log("DEBUG SSR Cookie Data:", JSON.stringify(userData, null, 2)); // <--- Debug Log

        // ✅ Validate decrypted data to prevent XSS
        if (typeof userData !== 'object' || userData === null) {
          console.error("Invalid user data format from cookie");
          return null;
        }

        // Helper to find data recursively or check paths
        let finalData: any = userData;

        // Unwrap nested 'data' if exists
        if (finalData.data && (finalData.data.user_id || finalData.data.data)) {
          finalData = finalData.data;
        }
        // Unwrap second level 'data' if exists
        if (finalData.data && (finalData.data.user_id || finalData.data.username)) {
          finalData = finalData.data;
        }

        const user_id = finalData.user_id || finalData.id || null;
        const username = finalData.username || null;
        const rawRole = finalData.role || finalData.role_name;
        const role_name = typeof rawRole === 'string' ? rawRole : (rawRole?.role_name || null);
        const avatar = finalData.avatar || null;

        console.log("DEBUG SSR Extracted:", { user_id, username });

        return {
          user_id,
          username,
          role_name,
          avatar,
        };
      } catch (error) {
        console.error("Error decrypting/parsing user cookie:", error);
        return null;
      }
    }
  } catch (error) {
    console.error("Error reading server cookie:", error instanceof Error ? error.message : 'Unknown error');
  }

  return null;
}

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  if (!FEATURES.user) {
    redirect("/");
  }

  const initialUserData = await getInitialUserData();

  // Redirect to login if not authenticated
  if (!initialUserData) {
    redirect("/auth");
  }

  const roleName = initialUserData.role_name?.toLowerCase();

  if (roleName === "admin" || roleName === "super_admin" || roleName === "superadmin") {
    redirect("/super-admin");
  } else if (roleName === "teacher" || roleName === "giảng viên") {
    redirect("/admin");
  }

  return (
    <RouteErrorBoundary routeName="user">
      <UserLayoutClient initialUserData={initialUserData}>{children}</UserLayoutClient>
    </RouteErrorBoundary>
  );
}
