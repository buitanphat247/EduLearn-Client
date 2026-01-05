import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ history_id: string }> | { history_id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const historyId = resolvedParams.history_id;

    if (!historyId) {
      return NextResponse.json(
        { status: 400, message: "Missing history_id", data: null },
        { status: 400 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { status: 400, message: "Invalid JSON body", data: null },
        { status: 400 }
      );
    }

    if (typeof body.current_index !== "number" || body.current_index < 0) {
      return NextResponse.json(
        { status: 400, message: "Index must be >= 0", data: null },
        { status: 400 }
      );
    }

    // Flask backend URL
    const flaskApiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://127.0.0.1:4018";
    const url = `${flaskApiUrl}/writing-chat-bot/history/${historyId}/index`;

    // Forward the request to Flask backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

    let backendResponse: Response;
    try {
      backendResponse = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_index: body.current_index,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          { status: 504, message: "Request timeout: Backend không phản hồi sau 30 giây", data: null },
          { status: 504 }
        );
      }
      if (
        fetchError.message?.includes("Failed to fetch") ||
        fetchError.message?.includes("ECONNREFUSED") ||
        fetchError.code === "ECONNREFUSED"
      ) {
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
