import { NextRequest } from 'next/server';

export const revalidate = 0;

export async function POST(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1611/api';
  const url = `${backendUrl}/auth/refresh`;

  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const authHeader = request.headers.get('authorization');
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;
    if (cookieHeader) headers['Cookie'] = cookieHeader;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const backendResponse = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    const contentType = backendResponse.headers.get('content-type');
    
    if (!contentType?.includes('application/json')) {
      return new Response(
        JSON.stringify({ status: false, message: 'Invalid response format', data: null }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await backendResponse.json();
    const responseHeaders = new Headers({ 'Content-Type': 'application/json' });

    // Forward Set-Cookie headers
    const setCookies = typeof backendResponse.headers.getSetCookie === 'function'
      ? backendResponse.headers.getSetCookie()
      : [];
    
    if (setCookies.length === 0) {
      backendResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') setCookies.push(value);
      });
    }

    setCookies.forEach(cookie => {
      responseHeaders.append('Set-Cookie', cookie.replace(/;\s*domain=[^;]*/gi, ''));
    });

    return new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: responseHeaders,
    });

  } catch (error: any) {
    const status = error.name === 'AbortError' ? 504 : 
                   error.message?.includes('ECONNREFUSED') ? 503 : 500;
    return new Response(
      JSON.stringify({ status: false, message: error?.message || 'Server error', data: null }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
