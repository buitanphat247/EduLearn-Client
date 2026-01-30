import { getServerAuthState } from "@/lib/utils/auth-server";
import HeaderClient from "./HeaderClient";
import { Suspense } from "react";

function HeaderSkeleton() {
  return (
    <div className="h-16 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 h-full flex items-center">
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default async function Header() {
  try {
    const initialAuth = await getServerAuthState();
    return (
      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderClient initialAuth={initialAuth} />
      </Suspense>
    );
  } catch (error) {
    console.error("Error loading header:", error);
    // Fallback với auth state mặc định
    return (
      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderClient
          initialAuth={{
            authenticated: false,
            userData: null,
          }}
        />
      </Suspense>
    );
  }
}
