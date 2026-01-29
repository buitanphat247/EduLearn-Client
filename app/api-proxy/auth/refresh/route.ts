import { NextRequest, NextResponse } from 'next/server';

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
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout (tối ưu cho refresh request)

    let backendResponse: Response;
    try {
      // Forward headers
      const forwardHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Forward Authorization header từ client (đã có Bearer token đã mã hóa)
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        forwardHeaders['Authorization'] = authHeader;
      }
      
      // Forward cookie nếu có (fallback)
      if (cookieHeader) {
        forwardHeaders['Cookie'] = cookieHeader;
      }
      
      backendResponse = await fetch(url, {
        method: 'POST',
        headers: forwardHeaders,
        body: JSON.stringify({}), // Empty body
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { status: false, message: 'Request timeout: Backend không phản hồi sau 10 giây', data: null },
          { status: 504 }
        );
      }
      if (fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { status: false, message: 'Lỗi kết nối: Không thể kết nối đến backend server.', data: null },
          { status: 503 }
        );
      }
      return NextResponse.json(
        {
          status: false,
          message: `Lỗi khi kết nối đến backend: ${fetchError.message || fetchError.toString()}`,
          data: null,
        },
        { status: 500 }
      );
    }

    const contentType = backendResponse.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await backendResponse.json();
      
      // Debug logs removed for performance
      
      // Forward response headers (đặc biệt là Set-Cookie nếu có)
      const responseHeaders = new Headers();
      backendResponse.headers.forEach((value, key) => {
        // Forward tất cả headers, đặc biệt là Set-Cookie
        if (key.toLowerCase() === 'set-cookie') {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      });

      return NextResponse.json(data, {
        status: backendResponse.status,
        headers: responseHeaders,
      });
    } else {
      const text = await backendResponse.text();
      return NextResponse.json(
        { status: false, message: `Unexpected response format: ${text}`, data: null },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        message: error?.message || 'Lỗi không xác định khi xử lý request',
        data: null,
      },
      { status: 500 }
    );
  }
}
