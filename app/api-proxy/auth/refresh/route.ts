import { NextRequest } from 'next/server';
import { TIMEOUTS } from '../../constants';
import { createErrorResponse, handleFetchError, logError } from '../../utils/errorHandler';

export const revalidate = 0;

export async function POST(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1611/api';
  const url = `${backendUrl}/auth/refresh`;

  try {
    // 🔴 DEBUG BREAKPOINT 7: Nhận request từ frontend - Kiểm tra cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const authHeader = request.headers.get('authorization');
    
    // Debug logging
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      console.log('[API Proxy Refresh] cookieHeader exists:', !!cookieHeader);
      console.log('[API Proxy Refresh] cookieHeader length:', cookieHeader.length);
      console.log('[API Proxy Refresh] authHeader exists:', !!authHeader);
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim().split('=')[0]);
        console.log('[API Proxy Refresh] Cookie names:', cookies);
      }
    }
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;
    if (cookieHeader) headers['Cookie'] = cookieHeader;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.PROFILE);

    // 🔴 DEBUG BREAKPOINT 8: Gọi backend API
    const backendResponse = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    const contentType = backendResponse.headers.get('content-type');
    
    if (!contentType?.includes('application/json')) {
      return createErrorResponse('Invalid response format', 500);
    }

    // 🔴 DEBUG BREAKPOINT 9: Nhận response từ backend
    const data = await backendResponse.json();
    
    // Debug logging
    if (isDev) {
      console.log('[API Proxy Refresh] Backend status:', backendResponse.status);
      console.log('[API Proxy Refresh] Response has access_token:', !!data?.access_token);
      console.log('[API Proxy Refresh] Response has cookies:', !!data?.cookies);
    }
    
    const responseHeaders = new Headers({ 'Content-Type': 'application/json' });

    // Forward Set-Cookie headers
    // 🔴 DEBUG BREAKPOINT 10: Xử lý Set-Cookie headers
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
    return handleFetchError(error, '/auth/refresh', 'POST');
  }
}
