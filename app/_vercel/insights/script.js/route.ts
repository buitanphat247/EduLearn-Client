import { NextResponse } from "next/server";

/**
 * Route handler for /_vercel/insights/script.js
 * 
 * Vercel Analytics tries to load this script, but it only exists on Vercel's platform.
 * This handler returns an empty JavaScript response to prevent 404 errors
 * and MIME type issues in the browser when running locally or on non-Vercel deployments.
 */
export async function GET() {
  // Return empty JavaScript with correct Content-Type
  // This prevents browser errors when Vercel Analytics tries to load insights script
  return new NextResponse("", {
    status: 200,
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
