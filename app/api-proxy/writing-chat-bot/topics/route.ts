import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    // Flask backend URL - có thể config qua env variable
    const flaskApiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://127.0.0.1:4018";
    
    // Build query params
    const queryParams = new URLSearchParams();
    if (category) {
      queryParams.append("category", category);
    }

    const url = `${flaskApiUrl}/writing-chat-bot/topics${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

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
          { status: "error", message: "Request timeout: Flask backend không phản hồi sau 30 giây" },
          { status: 504 }
        );
      }
      // Handle network errors
      if (fetchError.message?.includes("Failed to fetch") || fetchError.message?.includes("ECONNREFUSED") || fetchError.code === "ECONNREFUSED") {
        return NextResponse.json(
          { status: "error", message: "Lỗi kết nối: Không thể kết nối đến Flask backend server. Vui lòng kiểm tra cấu hình API URL." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { 
          status: "error",
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
        { status: "error", message: `Unexpected response format: ${text}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: "error",
        message: error?.message || "Lỗi không xác định khi xử lý request",
      },
      { status: 500 }
    );
  }
}

