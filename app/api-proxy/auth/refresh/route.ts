import { NextRequest } from "next/server";
import { TIMEOUTS } from "../../constants";
import { createErrorResponse, handleFetchError } from "../../utils/errorHandler";

export const revalidate = 0;

export async function POST(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1611/api";
  const url = `${backendUrl}/auth/refresh`;

  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const authHeader = request.headers.get("authorization");

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authHeader) headers["Authorization"] = authHeader;
    if (cookieHeader) headers["Cookie"] = cookieHeader;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.PROFILE);

    const backendResponse = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    const contentType = backendResponse.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      return createErrorResponse("Invalid response format", 500);
    }

    const data = await backendResponse.json();

    const responseHeaders = new Headers({ "Content-Type": "application/json" });

    // Forward Set-Cookie headers from backend
    const setCookies = typeof backendResponse.headers.getSetCookie === "function" ? backendResponse.headers.getSetCookie() : [];

    if (setCookies.length === 0) {
      backendResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") setCookies.push(value);
      });
    }

    setCookies.forEach((cookie) => {
      responseHeaders.append("Set-Cookie", cookie.replace(/;\s*domain=[^;]*/gi, ""));
    });

    return new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    return handleFetchError(error, "/auth/refresh", "POST");
  }
}
