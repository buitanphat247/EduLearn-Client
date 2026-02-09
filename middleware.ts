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

  // CSP Nonce Generation
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // CSP Header Construction
  // script-src: 'unsafe-eval' is often needed in dev for hot reloading. In prod, we try to be strict.
  // However, removing 'unsafe-inline' requires 'nonce-...' or 'strict-dynamic'.
  // style-src: kept 'unsafe-inline' for AntD and other dynamic styles for now.
  const isDev = process.env.NODE_ENV !== "production";
  const cspHeader = `
    default-src 'self';
    script-src 'self' ${isDev ? "'unsafe-eval'" : ""} 'nonce-${nonce}' https://fonts.googleapis.com https://cdn.tailwindcss.com https://unpkg.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com https://cdnjs.cloudflare.com;
    font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:;
    img-src 'self' data: blob: https: http:;
    connect-src 'self' https: wss: ws: http://localhost:* ws://localhost:*;
    frame-ancestors 'self';
    base-uri 'self';
    form-action 'self';
    media-src 'self' blob: https:;
    worker-src 'self' blob:;
    object-src 'none';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  // Chỉ kiểm tra cookie _u (user session) có tồn tại hay không
  // Nếu không có _u, user chưa đăng nhập hoặc session đã hết hạn (7 ngày)
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Handle redirects
  if (isProtectedRoute && !hasUserCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    const response = NextResponse.redirect(url);
    // Set CSP on redirect too (good practice)
    response.headers.set("Content-Security-Policy", cspHeader);
    return response;
  }

  // Nếu đang ở trang auth và có user session, redirect về home
  if (pathname.startsWith(authRoute) && hasUserCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    const response = NextResponse.redirect(url);
    response.headers.set("Content-Security-Policy", cspHeader);
    return response;
  }

  // Role-based access control sẽ được xử lý ở client-side hoặc server components
  // vì middleware chạy ở Edge Runtime không thể giải mã cookie

  // Allow request to proceed
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
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
