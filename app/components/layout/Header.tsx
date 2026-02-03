import { getServerAuthState } from "@/lib/utils/auth-server";
import HeaderClient from "./HeaderClient";
import { cookies } from "next/headers";

export default async function Header() {
  // Read theme from cookie on server
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme");
  const initialTheme = (themeCookie?.value === "dark" ? "dark" : "light") as "light" | "dark";

  try {
    const initialAuth = await getServerAuthState();
    return (
      <HeaderClient initialAuth={initialAuth} initialTheme={initialTheme} />
    );
  } catch (error) {
    console.error("Error loading header:", error);
    // Fallback với auth state mặc định
    return (
      <HeaderClient
        initialAuth={{
          authenticated: false,
          userData: null,
        }}
        initialTheme={initialTheme}
      />
    );
  }
}

