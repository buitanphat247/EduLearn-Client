import { NextRequest, NextResponse } from "next/server";
import { R2_PUBLIC_URL } from "@/lib/utils/media";

/**
 * Proxy image từ R2 để tránh lỗi CORS khi load ảnh từ domain ngoài (r2.dev).
 * Chỉ chấp nhận URL từ R2_PUBLIC_URL của dự án.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const decodedUrl = decodeURIComponent(url);
  if (!decodedUrl.startsWith(R2_PUBLIC_URL)) {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 403 });
  }

  try {
    const res = await fetch(decodedUrl, {
      headers: {
        Accept: "image/*",
      },
      cache: "force-cache",
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: res.status }
      );
    }

    const contentType = res.headers.get("Content-Type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err) {
    console.error("[proxy-image]", err);
    return NextResponse.json(
      { error: "Failed to proxy image" },
      { status: 502 }
    );
  }
}
