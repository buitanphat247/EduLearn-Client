import { NextRequest } from 'next/server';

export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // Backend NestJS URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1611/api';
    const url = `${backendUrl}/auth/refresh`;

    // Lấy cookie từ request để forward lên backend
    const cookieHeader = request.headers.get('cookie') || '';

    // Forward request đến backend NestJS
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let backendResponse: Response;
    try {
      const forwardHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        forwardHeaders['Authorization'] = authHeader;
      }
      
      if (cookieHeader) {
        forwardHeaders['Cookie'] = cookieHeader;
      }
      
      backendResponse = await fetch(url, {
        method: 'POST',
        headers: forwardHeaders,
        body: JSON.stringify({}),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ status: false, message: 'Request timeout: Backend không phản hồi sau 10 giây', data: null }),
          { status: 504, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('ECONNREFUSED')) {
        return new Response(
          JSON.stringify({ status: false, message: 'Lỗi kết nối: Không thể kết nối đến backend server.', data: null }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({
          status: false,
          message: `Lỗi khi kết nối đến backend: ${fetchError.message || fetchError.toString()}`,
          data: null,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const contentType = backendResponse.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await backendResponse.json();
      
      // QUAN TRỌNG: Phải tạo Headers object TRƯỚC, append Set-Cookie vào đó,
      // rồi mới tạo Response. Vì Response.headers là immutable sau khi tạo!
      const headers = new Headers({
        'Content-Type': 'application/json',
      });
      
      // Collect và forward Set-Cookie headers TRƯỚC khi tạo Response
      // Sử dụng getSetCookie() để lấy riêng từng cookie (API hiện đại)
      // Fallback về forEach nếu getSetCookie không available
      let setCookieHeaders: string[] = [];
      
      // Phương pháp 1: Dùng getSetCookie() (Node.js 18.14.1+, Edge runtime)
      if (typeof backendResponse.headers.getSetCookie === 'function') {
        setCookieHeaders = backendResponse.headers.getSetCookie();
        console.log('[Next.js API Proxy] Using getSetCookie(), found:', setCookieHeaders.length, 'cookies');
      } else {
        // Phương pháp 2: Fallback - dùng forEach (có thể gộp cookies thành 1 string)
        backendResponse.headers.forEach((value, key) => {
          if (key.toLowerCase() === 'set-cookie') {
            // Có thể value là "cookie1, cookie2" nếu bị gộp
            // Tách ra nếu cần (nhưng thường không cần vì cookies có thể chứa dấu phẩy trong expires)
            setCookieHeaders.push(value);
          }
        });
        console.log('[Next.js API Proxy] Using forEach fallback, found:', setCookieHeaders.length, 'cookies');
      }

      // Append tất cả Set-Cookie headers vào response
      // QUAN TRỌNG: Remove domain từ Set-Cookie để browser set cho current domain (frontend)
      // Backend có thể set domain = localhost:1611, nhưng frontend là localhost:3000
      setCookieHeaders.forEach((cookie, index) => {
        // Remove domain attribute từ cookie (nếu có) để browser tự dùng current domain
        // Format: name=value; Path=/; Domain=example.com; ...
        const cleanedCookie = cookie.replace(/;\s*domain=[^;]*/gi, '');
        headers.append('Set-Cookie', cleanedCookie);
        console.log(`[Next.js API Proxy] Set-Cookie ${index + 1} (cleaned):`, cleanedCookie.substring(0, 80) + '...');
      });

      if (setCookieHeaders.length === 0) {
        console.warn('[Next.js API Proxy] Refresh - No Set-Cookie headers in response!');
        console.log('[Next.js API Proxy] All backend headers:', Array.from(backendResponse.headers.entries()));
      } else {
        console.log('[Next.js API Proxy] ✅ Forwarded', setCookieHeaders.length, 'Set-Cookie headers');
      }

      // Tạo Response với Headers đã có Set-Cookie
      const response = new Response(JSON.stringify(data), {
        status: backendResponse.status,
        headers: headers,
      });

      return response;
    } else {
      const text = await backendResponse.text();
      return new Response(
        JSON.stringify({ status: false, message: `Unexpected response format: ${text}`, data: null }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('[Next.js API Proxy] Refresh error:', error);
    return new Response(
      JSON.stringify({
        status: false,
        message: error?.message || 'Lỗi không xác định khi xử lý request',
        data: null,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
