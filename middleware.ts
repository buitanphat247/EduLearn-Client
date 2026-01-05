import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  
  // Skip middleware for API proxy routes to avoid body size limit
  if (pathname.startsWith("/api-proxy")) {
    return NextResponse.next();
  }
  
  // Skip middleware for POST/PUT/PATCH requests to page routes
  // These should be handled by client-side JavaScript, not server-side page routes
  // Page routes in Next.js App Router don't handle POST requests unless using Server Actions
  if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
    // Only skip if it's a page route (not API route)
    if (!pathname.startsWith("/api")) {
      return NextResponse.next();
    }
  }
  
  const token = request.cookies.get("accessToken")?.value;
  const userCookie = request.cookies.get("user")?.value;

  const protectedRoutes = ["/admin", "/user", "/profile", "/super-admin"];
  const authRoute = "/auth";
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith(authRoute) && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (token && userCookie) {
    try {
      const user = JSON.parse(userCookie);
      const roleId = user?.role?.role_id;
      const roleName = user?.role?.role_name?.toLowerCase();

      if (pathname.startsWith("/admin")) {
        if (roleId === 1) {
          const url = request.nextUrl.clone();
          url.pathname = "/super-admin";
          return NextResponse.redirect(url);
        }
        if (roleId !== 2) {
          const url = request.nextUrl.clone();
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
      }

      if (pathname.startsWith("/user")) {
        if (roleId !== 3) {
          const url = request.nextUrl.clone();
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
      }

      if (pathname.startsWith("/super-admin")) {
        if (roleId !== 1) {
          const url = request.nextUrl.clone();
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      console.error("Error parsing user cookie in middleware:", error);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - api-proxy (API proxy routes for large file uploads)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|api-proxy|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

