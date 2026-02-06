import { NextRequest, NextResponse } from "next/server";
import { TIMEOUTS } from '../../constants';
import { createErrorResponse, handleFetchError, logError } from '../../utils/errorHandler';
import { cookieFilter } from '../../utils/cookieFilter';

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST handler for presigned-url endpoint
 * Proxies request to backend to get presigned URL for file upload
 */
export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1611/api";
    
    // Get request body
    const body = await request.json();
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
      return createErrorResponse("fileName and contentType are required", 400);
    }

    // Forward the request to the backend API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.DEFAULT);

    let backendResponse: Response;
    try {
      // Forward cookies and authorization headers
      const cookieHeader = request.headers.get("cookie");
      const authHeader = request.headers.get("authorization");
      const csrfHeader = request.headers.get("x-csrf-token");

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (authHeader) {
        headers.Authorization = authHeader;
      }

      // Use cookieFilter to properly filter and decode cookies
      if (cookieHeader) {
        const filteredCookies = cookieFilter.filterCookies(cookieHeader);
        if (filteredCookies) {
          headers.Cookie = filteredCookies;
        }
      }

      if (csrfHeader) {
        headers["X-CSRF-Token"] = csrfHeader;
      }

      backendResponse = await fetch(`${apiUrl}/assignment-attachments/presigned-url`, {
        method: "POST",
        headers,
        body: JSON.stringify({ fileName, contentType }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      return handleFetchError(fetchError, "/assignment-attachments/presigned-url", "POST");
    }

    const responseContentType = backendResponse.headers.get("content-type");
    const isJson = responseContentType?.includes("application/json");

    if (!backendResponse.ok) {
      const errorData = isJson
        ? await backendResponse.json()
        : await backendResponse.text();
      
      return NextResponse.json(
        { 
          message: errorData?.message || errorData?.error || errorData?.detail || errorData?.error_message || "Failed to get presigned URL",
          ...(isJson ? errorData : {})
        },
        { status: backendResponse.status }
      );
    }

    const responseData = isJson
      ? await backendResponse.json()
      : { message: "Presigned URL generated successfully" };

    return NextResponse.json(responseData, {
      status: backendResponse.status,
    });
  } catch (error: any) {
    logError(error, { route: '/assignment-attachments/presigned-url', method: 'POST' });
    return createErrorResponse(
      error?.message || "Internal server error",
      500,
      error
    );
  }
}
