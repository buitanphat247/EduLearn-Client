/**
 * CSRF Token Utility
 * @module lib/utils/csrf
 * @description Utility functions for managing CSRF tokens
 */

import axios from "axios";

const isDev = process.env.NODE_ENV === "development";

// CSRF token cache
let csrfTokenCache: string | null = null;
let csrfTokenTimestamp = 0;
const CSRF_TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get base URL for API requests
 */
const getBaseURL = (): string => {
  if (typeof window !== "undefined") return "/api-proxy";
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:1611/api";
};

/**
 * Fetch CSRF token from backend endpoint
 * This will trigger backend to set cookie (if needed) and return the token
 * @returns {Promise<string>} CSRF token
 * @throws {Error} If token cannot be fetched
 */
export const fetchCsrfToken = async (): Promise<string> => {
  try {
    // Always call endpoint to get valid token
    // The backend handles setting the _csrf cookie (httpOnly) containing the secret
    const response = await axios.get<{
      status: boolean;
      message: string;
      data: { csrfToken: string };
    }>(`${getBaseURL()}/auth/csrf-token`, {
      withCredentials: true,
    });

    if (response.data?.status && response.data?.data?.csrfToken) {
      return response.data.data.csrfToken;
    }

    throw new Error("CSRF token not found in response");
  } catch (error: any) {
    if (isDev) {
      console.error("[CSRF] Failed to fetch token:", error);
    }
    throw new Error("Failed to fetch CSRF token");
  }
};

/**
 * Get CSRF token (from cache or fetch new from API)
 * 
 * IMPORTANT: Cookie _csrf contains SECRET, not TOKEN!
 * We MUST call API endpoint to get the generated TOKEN.
 * 
 * @returns {Promise<string>} CSRF token (generated TOKEN, not SECRET)
 */
export const getCsrfToken = async (): Promise<string> => {
  const now = Date.now();

  // 1. Check if cached token is still valid
  // Cache contains the actual TOKEN (from API), not SECRET from cookie
  if (csrfTokenCache && now - csrfTokenTimestamp < CSRF_TOKEN_CACHE_TTL) {
    if (isDev) {
      console.log('[CSRF] Using cached token');
    }
    return csrfTokenCache;
  }

  // 2. Fetch new token from API endpoint
  // Backend will:
  // - Read SECRET from cookie _csrf (or generate new if not exists)
  // - Generate TOKEN from SECRET using req.csrfToken()
  // - Return TOKEN in response body
  try {
    const token = await fetchCsrfToken();
    
    // Validate token is not empty
    if (!token || !token.trim()) {
      throw new Error('CSRF token is empty');
    }
    
    // Cache the TOKEN (not SECRET)
    csrfTokenCache = token;
    csrfTokenTimestamp = now;
    
    if (isDev) {
      console.log('[CSRF] Fetched new token from API');
    }
    
    return token;
  } catch (error) {
    // If fetch fails and we have cached token, use it (might still be valid)
    if (csrfTokenCache) {
      if (isDev) {
        console.warn("[CSRF] Using cached token after fetch failure");
      }
      return csrfTokenCache;
    }
    throw error;
  }
};

/**
 * Clear CSRF token cache
 * @description Clears the cached CSRF token, forcing a fresh fetch on next request
 */
export const clearCsrfTokenCache = (): void => {
  csrfTokenCache = null;
  csrfTokenTimestamp = 0;
};

/**
 * Check if a request method requires CSRF token
 * @param {string} method - HTTP method
 * @returns {boolean} True if method requires CSRF token
 */
export const requiresCsrfToken = (method: string): boolean => {
  const upperMethod = method.toUpperCase();
  return ["POST", "PUT", "PATCH", "DELETE"].includes(upperMethod);
};
