import { NextRequest, NextResponse } from "next/server";
import { TIMEOUTS, BODY_SIZE_LIMITS } from '../../constants';
import { createErrorResponse, handleFetchError, logError } from '../../utils/errorHandler';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // Check content-length to prevent DoS
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > BODY_SIZE_LIMITS.DEFAULT) {
      return createErrorResponse('Request body too large. Maximum size is 10MB.', 413);
    }
    
    const body = await request.json();

    // Flask backend URL
    const flaskApiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://localhost:5000";
    
    const url = `${flaskApiUrl}/writing-chat-bot/generate`;

    // Forward the request to Flask backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.AI_GENERATION);

    let backendResponse: Response;
    try {
      backendResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      return handleFetchError(fetchError, '/writing-chat-bot/generate', 'POST');
    }

    const contentType = backendResponse.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await backendResponse.json();
      return NextResponse.json(data, { status: backendResponse.status });
    } else {
      const text = await backendResponse.text();
      return createErrorResponse(`Unexpected response format: ${text}`, 500);
    }
  } catch (error: any) {
    logError(error, { route: '/writing-chat-bot/generate', method: 'POST' });
    return createErrorResponse(
      error?.message || "Lỗi không xác định khi xử lý request",
      500,
      error
    );
  }
}

