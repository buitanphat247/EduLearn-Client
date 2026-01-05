import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for large file uploads

// Disable body size limit for file uploads
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    // Handle both Promise and direct params (Next.js 15+ uses Promise)
    const resolvedParams = params instanceof Promise ? await params : params;
    const attachmentId = resolvedParams.id;

    if (!attachmentId || attachmentId.trim() === "" || attachmentId === "undefined" || attachmentId === "null") {
      return NextResponse.json(
        { message: "attachment_id is required", received: attachmentId },
        { status: 400 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1611/api";
    const incomingFormData = await request.formData();

    // Validate that file exists in FormData
    const file = incomingFormData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "File is required" },
        { status: 400 }
      );
    }

    // Note: File size validation removed - backend will handle size limits
    // Frontend validation still applies (50MB) but API route allows larger files

    // Validate file type
    const validExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".zip", ".rar", ".jpg", ".jpeg", ".png", ".gif"];
    const fileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));
    
    if (!isValidExtension) {
      return NextResponse.json(
        { message: "Invalid file type. Supported formats: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, zip, rar, jpg, jpeg, png, gif" },
        { status: 400 }
      );
    }

    // Create new FormData with the file to ensure proper forwarding
    const newFormData = new FormData();
    newFormData.append("file", file, file.name);

    // Forward the request to the backend API with timeout (increased for large files)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout for large files

    let backendResponse: Response;
    try {
      backendResponse = await fetch(`${apiUrl}/assignment-attachments/${attachmentId}?userId=${userId}`, {
        method: "PATCH",
        body: newFormData,
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
      let errorData: any;
      try {
        errorData = isJson
          ? await backendResponse.json()
          : await backendResponse.text();
      } catch (parseError) {
        errorData = { message: `HTTP ${backendResponse.status}: ${backendResponse.statusText}` };
      }
      
      return NextResponse.json(
        { 
          message: errorData?.message || errorData?.error || errorData?.detail || errorData?.error_message || "Update failed",
          ...(isJson && typeof errorData === "object" ? errorData : {})
        },
        { status: backendResponse.status }
      );
    }

    let responseData: any;
    try {
      responseData = isJson
        ? await backendResponse.json()
        : { message: "File updated successfully" };
    } catch (parseError) {
      responseData = { message: "File updated successfully" };
    }

    return NextResponse.json(responseData, {
      status: backendResponse.status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        message: error?.message || "Internal server error",
        error: process.env.NODE_ENV === "development" ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

