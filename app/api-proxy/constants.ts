/**
 * API Proxy Constants
 * Centralized constants for all api-proxy routes
 */

// Timeout constants (in milliseconds)
export const TIMEOUTS = {
  DEFAULT: 30000,      // 30 seconds - default timeout
  PROFILE: 10000,      // 10 seconds - optimized for profile requests
  AI_GENERATION: 60000, // 60 seconds - timeout for AI generation
  FILE_UPLOAD: 300000,  // 5 minutes - timeout for large file uploads
} as const;

// Rate limiting constants
export const RATE_LIMIT = {
  MAX_REQUESTS: 100,
  WINDOW_MS: 60000, // 1 minute
} as const;

// Body size limits (in bytes)
export const BODY_SIZE_LIMITS = {
  DEFAULT: 10 * 1024 * 1024, // 10MB
  FILE_UPLOAD: 100 * 1024 * 1024, // 100MB
} as const;

// Allowed cookie names for forwarding
export const ALLOWED_COOKIE_NAMES = ['_u', 'access_token', 'refresh_token'] as const;
