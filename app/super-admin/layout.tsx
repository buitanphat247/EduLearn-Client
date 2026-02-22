import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import SuperAdminLayoutClient from "./SuperAdminLayoutClient";
import { decryptCookie } from "@/lib/utils/server-cookie-decrypt";
import { FEATURES } from "@/app/config/features";

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
  if (!FEATURES.superAdmin) {
    redirect("/");
  }

  const initialUserData = await getInitialUserData();

  // Redirect to login if not authenticated
  if (!initialUserData) {
    redirect("/auth");
  }

  // Ensure only super_admins and admins can access this route
  const roleName = initialUserData.role_name?.toLowerCase();
  const roleId = Number(initialUserData.user_id === 1 ? 1 : 0); // Temporary check if ID 1 is Super Admin? No, role_id is better.

  // We should trust role_name if it exists
  const isAdmin = roleName === "super_admin" || roleName === "superadmin" || roleName === "admin";

  if (!isAdmin) {
    if (roleName === "teacher" || roleName === "giảng viên") {
      redirect("/admin");
    } else {
      redirect("/user");
    }
  }

  return <SuperAdminLayoutClient initialUserData={initialUserData}>{children}</SuperAdminLayoutClient>;
}

