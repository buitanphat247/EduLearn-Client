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
  
  // Lưu ý: Cookie đã được mã hóa và đổi tên thành _at và _u để khó đoán
  // Middleware chỉ kiểm tra cookie có tồn tại hay không
  // Việc giải mã và kiểm tra role sẽ được thực hiện ở client-side hoặc server components
  const hasAccessToken = request.cookies.has("_at");
  const hasUserCookie = request.cookies.has("_u");

  const protectedRoutes = ["/admin", "/user", "/profile", "/super-admin"];
  const authRoute = "/auth";
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Chỉ kiểm tra cookie có tồn tại hay không (đã được mã hóa)
  if (isProtectedRoute && !hasAccessToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith(authRoute) && hasAccessToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Role-based access control sẽ được xử lý ở client-side hoặc server components
  // vì middleware chạy ở Edge Runtime không thể giải mã cookie
  
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

