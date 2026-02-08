import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // No longer needed as api-proxy is removed
  /* if (pathname.startsWith("/api-proxy")) {
    return NextResponse.next();
  } */

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
  // - _at: Access Token (maxAge = 15 phút, hết hạn cùng với token)
  // - _u: User Data (maxAge = 7 ngày, dùng để check session)
  //
  // QUAN TRỌNG: Middleware chỉ check cookie _u (user session), KHÔNG check _at
  // Vì khi accessToken hết hạn, cookie _at cũng hết hạn, nhưng user vẫn có thể refresh
  // Nếu check _at, middleware sẽ redirect về /auth trước khi frontend kịp refresh token
  const hasUserCookie = request.cookies.has("_u");

  const protectedRoutes = ["/admin", "/user", "/profile", "/super-admin"];
  const authRoute = "/auth";

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Chỉ kiểm tra cookie _u (user session) có tồn tại hay không
  // Nếu không có _u, user chưa đăng nhập hoặc session đã hết hạn (7 ngày)
  if (isProtectedRoute && !hasUserCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // Nếu đang ở trang auth và có user session, redirect về home
  if (pathname.startsWith(authRoute) && hasUserCookie) {
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
