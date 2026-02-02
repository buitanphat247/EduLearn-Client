import { NextRequest, NextResponse } from 'next/server';
import { TIMEOUTS } from '../../constants';
import { createErrorResponse, handleFetchError, logError } from '../../utils/errorHandler';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Backend NestJS URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1611/api';
    const url = `${backendUrl}/auth/profile`;

    // Lấy cookie từ request để forward lên backend
    const cookieHeader = request.headers.get('cookie') || '';

    // Forward request đến backend NestJS
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.PROFILE);

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
        method: 'GET',
        headers: forwardHeaders,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      return handleFetchError(fetchError, '/auth/profile', 'GET');
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
      return createErrorResponse(`Unexpected response format: ${text}`, 500);
    }
  } catch (error: any) {
    logError(error, { route: '/auth/profile', method: 'GET' });
    return createErrorResponse(
      error?.message || 'Lỗi không xác định khi xử lý request',
      500,
      error
    );
  }
}
