import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;


  // Skip proxy for POST/PUT/PATCH requests to page routes
  // These should be handled by client-side JavaScript, not server-side page routes
  // Page routes in Next.js App Router don't handle POST requests unless using Server Actions
  if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
    // Only skip if it's a page route (not API route)
    if (!pathname.startsWith("/api")) {
      return NextResponse.next();
    }
  }

  // Check cookie _u (user session) - not _at to allow token refresh
  const hasUserCookie = request.cookies.has("_u");

  const protectedRoutes = ["/admin", "/user", "/profile", "/super-admin"];
  const authRoute = "/auth";

  const isDev = process.env.NODE_ENV !== "production";
  // Note: 'unsafe-inline' is required for inline scripts (no-transitions script, Vercel Analytics)
  // Nonce is removed because it makes 'unsafe-inline' ineffective per CSP spec
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://fonts.googleapis.com https://cdn.tailwindcss.com https://unpkg.com https://vercel.live;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com https://cdnjs.cloudflare.com;
    font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:;
    img-src 'self' data: blob: https: http:;
    connect-src 'self' https: wss: ws: http://localhost:* ws://localhost:* https://vercel.live;
    frame-ancestors 'self';
    base-uri 'self';
    form-action 'self';
    media-src 'self' blob: https:;
    worker-src 'self' blob:;
    object-src 'none';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

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

  // Allow request to proceed
  const requestHeaders = new Headers(request.headers);
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
     * - _vercel/ (Vercel Insights script - handled by route handler)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|_vercel/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
