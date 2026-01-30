import { NextRequest } from 'next/server';

export const revalidate = 0;

// Các methods cần support
const SUPPORTED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

async function handleRequest(request: NextRequest, method: string) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1611/api';
    
    // Lấy path từ URL (bỏ prefix /api-proxy)
    const url = new URL(request.url);
    const path = url.pathname.replace('/api-proxy', '');
    const targetUrl = `${backendUrl}${path}${url.search}`;
    
    console.log(`[API Proxy] ${method} ${path}`);
    console.log(`[API Proxy] Has Authorization:`, !!authHeader);
    console.log(`[API Proxy] Has Cookie:`, !!cookieHeader);
    if (cookieHeader) {
      console.log(`[API Proxy] Cookie _at exists:`, cookieHeader.includes('_at='));
      console.log(`[API Proxy] Cookie _u exists:`, cookieHeader.includes('_u='));
    }

    // Forward headers
    const forwardHeaders: Record<string, string> = {
      'Content-Type': request.headers.get('content-type') || 'application/json',
    };
    
    // Forward Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      forwardHeaders['Authorization'] = authHeader;
    }
    
    // Forward cookies
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      forwardHeaders['Cookie'] = cookieHeader;
    }

    // Forward body cho POST/PUT/PATCH
    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await request.text();
      } catch (e) {
        // No body
      }
    }

    // Call backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let backendResponse: Response;
    try {
      backendResponse = await fetch(targetUrl, {
        method,
        headers: forwardHeaders,
        body: body || undefined,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ status: false, message: 'Request timeout', data: null }),
          { status: 504, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ status: false, message: `Backend error: ${fetchError.message}`, data: null }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build response headers
    const headers = new Headers({
      'Content-Type': backendResponse.headers.get('content-type') || 'application/json',
    });

    // Forward Set-Cookie headers
    if (typeof backendResponse.headers.getSetCookie === 'function') {
      const setCookieHeaders = backendResponse.headers.getSetCookie();
      setCookieHeaders.forEach(cookie => {
        // Remove domain để browser dùng current domain
        const cleanedCookie = cookie.replace(/;\s*domain=[^;]*/gi, '');
        headers.append('Set-Cookie', cleanedCookie);
      });
    } else {
      backendResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
          const cleanedCookie = value.replace(/;\s*domain=[^;]*/gi, '');
          headers.append('Set-Cookie', cleanedCookie);
        }
      });
    }

    // Return response
    const contentType = backendResponse.headers.get('content-type');
    
    // Debug log cho 401
    if (backendResponse.status === 401) {
      console.log(`[API Proxy] ⚠️ Got 401 from backend for ${path}`);
    }
    
    if (contentType?.includes('application/json')) {
      const data = await backendResponse.json();
      
      // Debug log cho 401 response
      if (backendResponse.status === 401) {
        console.log(`[API Proxy] 401 Response:`, JSON.stringify(data));
      }
      
      return new Response(JSON.stringify(data), {
        status: backendResponse.status,
        headers,
      });
    } else {
      const text = await backendResponse.text();
      return new Response(text, {
        status: backendResponse.status,
        headers,
      });
    }
  } catch (error: any) {
    console.error('[API Proxy] Error:', error);
    return new Response(
      JSON.stringify({ status: false, message: error?.message || 'Unknown error', data: null }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE');
}
