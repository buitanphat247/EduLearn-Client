import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Flask backend URL
    const flaskApiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://127.0.0.1:4018";
    
    const url = `${flaskApiUrl}/writing-chat-bot/generate`;

    // Forward the request to Flask backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout for AI generation

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
      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          { status: 500, message: "Request timeout: Flask backend không phản hồi sau 60 giây" },
          { status: 504 }
        );
      }
      if (fetchError.message?.includes("Failed to fetch") || fetchError.message?.includes("ECONNREFUSED")) {
        return NextResponse.json(
          { status: 503, message: "Lỗi kết nối: Không thể kết nối đến Flask backend server." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { 
          status: 500,
          message: `Lỗi khi kết nối đến Flask backend: ${fetchError.message || fetchError.toString()}`,
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
        { status: 500, message: `Unexpected response format: ${text}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 500,
        message: error?.message || "Lỗi không xác định khi xử lý request",
      },
      { status: 500 }
    );
  }
}

