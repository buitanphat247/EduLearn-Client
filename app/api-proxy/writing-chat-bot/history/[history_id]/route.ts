import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ history_id: string }> | { history_id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const historyId = resolvedParams.history_id;

    if (!historyId) {
      return NextResponse.json(
        { status: 400, message: "History ID is required", data: null },
        { status: 400 }
      );
    }

    // Flask backend URL
    const flaskApiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://127.0.0.1:4018";
    
    const url = `${flaskApiUrl}/writing-chat-bot/history/${historyId}`;

    // Forward the request to Flask backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

    let backendResponse: Response;
    try {
      backendResponse = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          { status: 504, message: "Request timeout: Flask backend không phản hồi sau 30 giây", data: null },
          { status: 504 }
        );
      }
      if (fetchError.message?.includes("Failed to fetch") || fetchError.message?.includes("ECONNREFUSED")) {
        return NextResponse.json(
          { status: 503, message: "Lỗi kết nối: Không thể kết nối đến Flask backend server.", data: null },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { 
          status: 500,
          message: `Lỗi khi kết nối đến Flask backend: ${fetchError.message || fetchError.toString()}`,
          data: null,
        },
        { status: 500 }
      );
    }

    const contentType = backendResponse.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await backendResponse.json();
      return NextResponse.json(data, { status: backendResponse.status });
    } else {
      const text = await backendResponse.text();
      return NextResponse.json(
        { status: 500, message: `Unexpected response format: ${text}`, data: null },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 500,
        message: error?.message || "Lỗi không xác định khi xử lý request",
        data: null,
      },
      { status: 500 }
    );
  }
}

