import { NextRequest } from 'next/server';

export const revalidate = 0;

const isDev = process.env.NODE_ENV === 'development';

async function handleRequest(request: NextRequest, method: string) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1611/api';
  const url = new URL(request.url);
  const path = url.pathname.replace('/api-proxy', '');
  const targetUrl = `${backendUrl}${path}${url.search}`;

  try {
    const headers: Record<string, string> = {
      'Content-Type': request.headers.get('content-type') || 'application/json',
    };
    
    const auth = request.headers.get('authorization');
    const cookie = request.headers.get('cookie');
    if (auth) headers['Authorization'] = auth;
    if (cookie) headers['Cookie'] = cookie;

    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try { body = await request.text(); } catch { }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(targetUrl, {
      method,
      headers,
      body: body || undefined,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

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
    setCookies.forEach(c => responseHeaders.append('Set-Cookie', c.replace(/;\s*domain=[^;]*/gi, '')));

    if (isDev && response.status === 401) {
      console.log(`[Proxy] 401 ${method} ${path}`);
    }

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return new Response(JSON.stringify(data), { status: response.status, headers: responseHeaders });
    }
    
    const text = await response.text();
    return new Response(text, { status: response.status, headers: responseHeaders });

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
