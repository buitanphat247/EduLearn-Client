import { NextRequest, NextResponse } from "next/server";
import { TIMEOUTS } from '../constants';
import { createErrorResponse, handleFetchError, logError } from '../utils/errorHandler';
import { cookieFilter } from '../utils/cookieFilter';

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for large file uploads
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return createErrorResponse("userId is required", 400);
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1611/api";
    const formData = await request.formData();

    // Forward cookies and authorization headers
    const cookieHeader = request.headers.get("cookie");
    const authHeader = request.headers.get("authorization");
    const csrfHeader = request.headers.get("x-csrf-token");

    const headers: HeadersInit = {
      // Don't set Content-Type for multipart/form-data - let browser set boundary
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

    // Forward the request to the backend API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.FILE_UPLOAD);

    let backendResponse: Response;
    try {
      backendResponse = await fetch(`${apiUrl}/assignment-attachments?userId=${userId}`, {
        method: "POST",
        headers,
        body: formData,
        signal: controller.signal,
        // Don't set Content-Type header - let fetch set it automatically with boundary
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      return handleFetchError(fetchError, '/assignment-attachments', 'POST');
    }

    const contentType = backendResponse.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    if (!backendResponse.ok) {
      const errorData = isJson
        ? await backendResponse.json()
        : await backendResponse.text();
      
      return NextResponse.json(
        { 
          message: errorData?.message || errorData?.error || errorData?.detail || errorData?.error_message || "Upload failed",
          ...(isJson ? errorData : {})
        },
        { status: backendResponse.status }
      );
    }

    const responseData = isJson
      ? await backendResponse.json()
      : { message: "File uploaded successfully" };

    return NextResponse.json(responseData, {
      status: backendResponse.status,
    });
  } catch (error: any) {
    logError(error, { route: '/assignment-attachments', method: 'POST' });
    return createErrorResponse(
      error?.message || "Internal server error",
      500,
      error
    );
  }
}


