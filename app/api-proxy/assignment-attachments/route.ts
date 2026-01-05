import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for large file uploads
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1611/api";
    const formData = await request.formData();

    // Forward the request to the backend API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout for large files

    let backendResponse: Response;
    try {
      backendResponse = await fetch(`${apiUrl}/assignment-attachments?userId=${userId}`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
        // Don't set Content-Type header - let fetch set it automatically with boundary
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          { message: "Request timeout: Backend không phản hồi sau 5 phút" },
          { status: 504 }
        );
      }
      // Handle network errors
      if (fetchError.message?.includes("Failed to fetch") || fetchError.message?.includes("ECONNREFUSED") || fetchError.code === "ECONNREFUSED") {
        return NextResponse.json(
          { message: "Lỗi kết nối: Không thể kết nối đến backend server. Vui lòng kiểm tra cấu hình API URL." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { 
          message: `Lỗi khi kết nối đến backend: ${fetchError.message || fetchError.toString()}`,
          error: process.env.NODE_ENV === "development" ? fetchError?.stack : undefined
        },
        { status: 500 }
      );
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
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}


