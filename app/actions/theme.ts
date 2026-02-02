"use server";

import { cookies } from "next/headers";
import { headers } from "next/headers";

// Constants
const VALID_THEMES = ["light", "dark"] as const;
type Theme = typeof VALID_THEMES[number];

const COOKIE_MAX_AGE_ONE_YEAR = 60 * 60 * 24 * 365; // 1 year in seconds

// Rate limiting configuration
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds

// In-memory rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique identifier (e.g., IP address)
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
function checkRateLimit(
  identifier: string,
  maxRequests = RATE_LIMIT_MAX_REQUESTS,
  windowMs = RATE_LIMIT_WINDOW_MS
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Set theme cookie with validation, error handling, and rate limiting
 * @param theme - Theme value ("light" or "dark")
 * @returns Object with success status and optional error message
 */
export async function setThemeCookie(
  theme: Theme | string
): Promise<{ success: boolean; error?: string; theme?: Theme }> {
  try {
    // Rate limiting: Get client IP
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";

    // Check rate limit
    if (!checkRateLimit(`theme:${ip}`)) {
      // Log rate limit violation
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Theme Action] Rate limit exceeded:", { ip, timestamp: new Date().toISOString() });
      }
      // In production, send to monitoring service
      // Example: logger.warn("Rate limit exceeded", { ip, action: "setThemeCookie" });

      return {
        success: false,
        error: `Rate limit exceeded. Please try again in ${RATE_LIMIT_WINDOW_MS / 1000} seconds.`,
      };
    }

    // Validate input
    if (!theme || typeof theme !== "string") {
      return { success: false, error: "Theme must be a string" };
    }

    // Sanitize and validate theme value
    const sanitizedTheme = theme.trim().toLowerCase();
    if (!VALID_THEMES.includes(sanitizedTheme as Theme)) {
      return {
        success: false,
        error: `Invalid theme. Must be one of: ${VALID_THEMES.join(", ")}`,
      };
    }

    // Set cookie
    // SECURITY NOTE: httpOnly is set to false to allow client-side access for theme preference
    // This is ACCEPTED as required for client-side theme rendering on page load.
    // Security mitigations applied:
    // 1. Strict input validation: Only "light" or "dark" values allowed (VALID_THEMES whitelist)
    // 2. Input sanitization: trim() and toLowerCase() to prevent injection
    // 3. Rate limiting: Prevents abuse and potential XSS attacks via cookie manipulation
    // 4. SameSite: "lax" prevents CSRF attacks
    // 5. Secure flag: Enabled in production to ensure HTTPS-only transmission
    // 6. Cookie value is non-sensitive: Theme preference only, no user data or tokens
    const cookieStore = await cookies();
    cookieStore.set("theme", sanitizedTheme, {
      httpOnly: false, // Required for client-side access - XSS risk mitigated via strict validation
      secure: process.env.NODE_ENV === "production", // HTTPS-only in production
      maxAge: COOKIE_MAX_AGE_ONE_YEAR,
      path: "/",
      sameSite: "lax", // CSRF protection
    });

    // Structured logging for theme changes
    const logData = {
      theme: sanitizedTheme,
      ip,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    if (process.env.NODE_ENV !== "production") {
      console.log("[Theme Action] Theme changed successfully:", logData);
    }
    // In production, you can send to logging service (e.g., Sentry, LogRocket)
    // Example: logger.info("Theme changed", logData);

    return { success: true, theme: sanitizedTheme as Theme };
  } catch (error) {
    // Structured error logging
    const errorData = {
      error: error instanceof Error ? error.message : "Unknown error occurred",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    console.error("[Theme Action] Error setting theme cookie:", errorData);
    // In production, send to error tracking service
    // Example: logger.error("Theme action failed", errorData);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
