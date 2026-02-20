import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

      return {
        user_id: finalData.user_id || finalData.id || null,
        username: finalData.username || null,
        role_name: typeof (finalData.role || finalData.role_name) === 'string' ? (finalData.role || finalData.role_name) : (finalData.role?.role_name || null),
        avatar: finalData.avatar || null,
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

  // Redirect to login if not authenticated
  if (!initialUserData) {
    redirect("/auth");
  }

  // Ensure only admins can access this route
  const roleName = initialUserData.role_name?.toLowerCase();
  // We check for 'admin' (you could potentially check 'super_admin' or others based on your need)
  if (roleName !== "admin" && roleName !== "superadmin" && roleName !== "super_admin") {
    redirect("/");
  }

  return (
    <RouteErrorBoundary routeName="admin">
      <AdminLayoutClient initialUserData={initialUserData}>{children}</AdminLayoutClient>
    </RouteErrorBoundary>
  );
}
