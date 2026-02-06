/**
 * Sanitize input string to prevent XSS attacks
 * Removes potentially dangerous characters and HTML tags
 * @param value - Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(value: string): string {
  if (!value || typeof value !== "string") {
    return "";
  }

  // Remove HTML tags
  let sanitized = value.replace(/<[^>]*>/g, "");

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>'"&]/g, "");

  // Remove script tags and event handlers (case insensitive)
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=/gi, "");

  // Do not trim aggressively during typing
  // sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitize input for display (allows safe HTML but removes scripts)
 * More permissive than sanitizeInput - use when you need to preserve some formatting
 * @param value - Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeForDisplay(value: string): string {
  if (!value || typeof value !== "string") {
    return "";
  }

  // Remove script tags and event handlers
  let sanitized = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=/gi, "");

  return sanitized.trim();
}
