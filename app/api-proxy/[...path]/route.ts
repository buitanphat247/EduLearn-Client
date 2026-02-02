import { NextRequest } from 'next/server';
import { proxyCache } from '../utils/cache';
import { RATE_LIMIT, TIMEOUTS, ALLOWED_COOKIE_NAMES } from '../constants';

export const revalidate = 0;

const isDev = process.env.NODE_ENV === 'development';

// In-memory rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique identifier (e.g., IP address)
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Object with success status and rate limit info
 */
function checkRateLimit(
  identifier: string,
  maxRequests = RATE_LIMIT.MAX_REQUESTS,
  windowMs = RATE_LIMIT.WINDOW_MS
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  record.count++;
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    reset: Math.ceil((record.resetTime - now) / 1000),
  };
}

// Allowed API paths to prevent SSRF
const ALLOWED_PATHS = [
  '/auth',
  '/friends',
  '/writing-chat-bot',
  '/assignment-attachments',
  '/users',
  '/classes',
  '/students',
  '/stats',
  '/events',
  '/news',
  '/vocabulary',
  '/writing',
];

function isPathAllowed(path: string): boolean {
  return ALLOWED_PATHS.some(allowed => path.startsWith(allowed));
}

async function handleRequest(request: NextRequest, method: string) {
  // Rate limiting: Get client IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Check rate limit
  const rateLimitResult = checkRateLimit(`api-proxy:${ip}`);
  if (!rateLimitResult.success) {
    return new Response(
      JSON.stringify({
        status: false,
        message: `Rate limit exceeded. Try again in ${rateLimitResult.reset} seconds.`,
        data: null,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
        },
      }
    );
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1611/api';
  const url = new URL(request.url);
  const path = url.pathname.replace('/api-proxy', '');
  const searchParams = url.search;
  
  // Validate path to prevent SSRF
  if (!isPathAllowed(path)) {
    return new Response(
      JSON.stringify({ status: false, message: 'Path not allowed', data: null }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Prevent SSRF - validate target URL
  const targetUrl = `${backendUrl}${path}${searchParams}`;
  const targetUrlObj = new URL(targetUrl);
  const backendUrlObj = new URL(backendUrl);
  
  // Ensure target is from allowed backend
  if (targetUrlObj.hostname !== backendUrlObj.hostname || targetUrlObj.protocol !== backendUrlObj.protocol) {
    return new Response(
      JSON.stringify({ status: false, message: 'Invalid target URL', data: null }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Extract userId from cookie/header if available (for user-specific caching)
  let userId: string | undefined;
  try {
    const cookie = request.headers.get('cookie');
    if (cookie) {
      const userMatch = cookie.match(/_u=([^;]+)/);
      if (userMatch) {
        userId = userMatch[1];
      }
    }
  } catch {
    // Ignore cookie parsing errors
  }

  // Check cache for GET requests
  if (method === 'GET') {
    const cached = proxyCache.get(method, path, searchParams, userId);
    if (cached) {
      return new Response(cached.data, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...cached.headers,
        },
      });
    }
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': request.headers.get('content-type') || 'application/json',
    };
    
    const auth = request.headers.get('authorization');
    const cookie = request.headers.get('cookie');
    if (auth) headers['Authorization'] = auth;
    
    // Only forward specific cookies to prevent leaking sensitive cookies
    
    function filterCookies(cookieHeader: string | null): string {
      if (!cookieHeader) return '';
      
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const filtered = cookies.filter(cookie => {
        const name = cookie.split('=')[0].trim();
        return (ALLOWED_COOKIE_NAMES as readonly string[]).includes(name);
      });
      
      return filtered.join('; ');
    }
    
    const filteredCookie = filterCookies(cookie);
    if (filteredCookie) headers['Cookie'] = filteredCookie;

    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try { body = await request.text(); } catch { }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.DEFAULT);

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method,
        headers,
        body: body || undefined,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const contentType = response.headers.get('content-type');
    const responseHeaders = new Headers({
      'Content-Type': contentType || 'application/json',
    });

    // Forward Set-Cookie
    const setCookies = typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : [];
    if (setCookies.length === 0) {
      response.headers.forEach((v, k) => {
        if (k.toLowerCase() === 'set-cookie') setCookies.push(v);
      });
    }
    // Clean Set-Cookie headers to prevent domain/security issues
    setCookies.forEach(c => {
      const cleaned = c
        .replace(/;\s*domain=[^;]*/gi, '')
        .replace(/;\s*secure/gi, '')
        .replace(/;\s*httponly/gi, '')
        .replace(/;\s*samesite=[^;]*/gi, '');
      responseHeaders.append('Set-Cookie', cleaned);
    });

    if (isDev && response.status === 401) {
      console.log(`[Proxy] 401 ${method} ${path}`);
    }

    let responseData: string;
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      responseData = JSON.stringify(data);
    } else {
      responseData = await response.text();
    }

    // Cache successful GET responses
    if (method === 'GET' && response.status === 200) {
      proxyCache.set(
        method,
        path,
        searchParams,
        responseData,
        responseHeaders,
        userId
      );
    }

    // Add cache status header
    responseHeaders.set('X-Cache', 'MISS');

    return new Response(responseData, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error: any) {
    const status = error.name === 'AbortError' ? 504 : 503;
    return new Response(
      JSON.stringify({ status: false, message: error?.message || 'Server error', data: null }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const GET = (req: NextRequest) => handleRequest(req, 'GET');
export const POST = (req: NextRequest) => handleRequest(req, 'POST');
export const PUT = (req: NextRequest) => handleRequest(req, 'PUT');
export const PATCH = (req: NextRequest) => handleRequest(req, 'PATCH');
export const DELETE = (req: NextRequest) => handleRequest(req, 'DELETE');
