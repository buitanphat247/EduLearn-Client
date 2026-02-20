import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import SuperAdminLayoutClient from "./SuperAdminLayoutClient";
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
      } catch (error) {
        console.error("Error decrypting/parsing user cookie:", error);
      }
    }
  } catch (error) {
    console.error("Error reading server cookie:", error);
  }

  return null;
}

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const initialUserData = await getInitialUserData();

  // Redirect to login if not authenticated
  if (!initialUserData) {
    redirect("/auth");
  }

  // Ensure only super_admins can access this route
  const roleName = initialUserData.role_name?.toLowerCase();

  if (roleName !== "super_admin" && roleName !== "superadmin") {
    // If they are an admin, redirect to admin, else default to root
    if (roleName === "admin") {
      redirect("/admin");
    } else {
      redirect("/");
    }
  }

  return <SuperAdminLayoutClient initialUserData={initialUserData}>{children}</SuperAdminLayoutClient>;
}

