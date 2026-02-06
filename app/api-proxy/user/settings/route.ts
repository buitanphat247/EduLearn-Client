import { NextRequest, NextResponse } from "next/server";
import { handleFetchError } from "../../utils/errorHandler";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1611/api";
  const url = `${backendUrl}/users/settings`;

  try {
    const body = await request.json();
    const cookieHeader = request.headers.get("cookie") || "";
    const authHeader = request.headers.get("authorization");

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authHeader) headers["Authorization"] = authHeader;
    if (cookieHeader) headers["Cookie"] = cookieHeader;

    const backendResponse = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    // Check if 404 - Mock callback
    if (backendResponse.status === 404) {
      return NextResponse.json({
        status: true,
        message: "Settings updated (Mock - Backend endpoint not ready)",
        data: body,
      });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error: any) {
    return handleFetchError(error, "/users/settings", "PUT");
  }
}
