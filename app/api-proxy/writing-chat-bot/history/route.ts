import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");
    const orderBy = searchParams.get("order_by");
    const orderDesc = searchParams.get("order_desc");

    // Flask backend URL
    const flaskApiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://127.0.0.1:4018";

    // Build query params
    const queryParams = new URLSearchParams();
    if (userId) queryParams.append("user_id", userId);
    if (limit) queryParams.append("limit", limit);
    if (page) queryParams.append("page", page);
    if (orderBy) queryParams.append("order_by", orderBy);
    if (orderDesc !== null) queryParams.append("order_desc", orderDesc);

    const url = `${flaskApiUrl}/writing-chat-bot/history${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

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
          { status: 504, message: "Request timeout: Backend không phản hồi sau 30 giây" },
          { status: 504 }
        );
      }
      if (fetchError.message?.includes("Failed to fetch") || fetchError.message?.includes("ECONNREFUSED") || fetchError.code === "ECONNREFUSED") {
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

