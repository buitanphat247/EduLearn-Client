/**
 * SSRF Protection Service
 * Handles SSRF (Server-Side Request Forgery) protection
 */

/**
 * Allowed API paths to prevent SSRF attacks
 */
const ALLOWED_PATHS = [
  '/auth',
  '/friends',
  '/writing-chat-bot',
  '/assignment-attachments',
  '/users',
  '/classes',
  '/students',
  '/stats',
  '/events',
  '/news',
  '/vocabulary',
  '/writing',
] as const;

/**
 * SSRF Protection Service
 * Validates paths and URLs to prevent SSRF attacks
 */
export class SSRFProtectionService {
  /**
   * Check if path is allowed
   * @param path - API path to check
   * @returns true if path is allowed, false otherwise
   */
  isPathAllowed(path: string): boolean {
    return ALLOWED_PATHS.some(allowed => path.startsWith(allowed));
  }

  /**
   * Validate target URL to prevent SSRF
   * Ensures target URL is from allowed backend
   * @param targetUrl - Target URL to validate
   * @param backendUrl - Allowed backend URL
   * @returns true if URL is valid, false otherwise
   */
  validateTargetUrl(targetUrl: string, backendUrl: string): boolean {
    try {
      const targetUrlObj = new URL(targetUrl);
      const backendUrlObj = new URL(backendUrl);

      // Ensure target is from allowed backend
      return (
        targetUrlObj.hostname === backendUrlObj.hostname &&
        targetUrlObj.protocol === backendUrlObj.protocol
      );
    } catch {
      // Invalid URL format
      return false;
    }
  }

  /**
   * Build target URL from backend URL, path, and search params
   * @param backendUrl - Backend base URL
   * @param path - API path
   * @param searchParams - URL search params
   * @returns Complete target URL
   */
  buildTargetUrl(backendUrl: string, path: string, searchParams: string): string {
    return `${backendUrl}${path}${searchParams}`;
  }

  /**
   * Extract path from request URL
   * Removes '/api-proxy' prefix
   * @param requestUrl - Full request URL
   * @returns API path without '/api-proxy' prefix
   */
  extractPath(requestUrl: string): string {
    try {
      const url = new URL(requestUrl);
      return url.pathname.replace('/api-proxy', '');
    } catch {
      return '';
    }
  }

  /**
   * Validate complete request path and URL
   * @param requestUrl - Full request URL
   * @param backendUrl - Backend base URL
   * @returns Validation result with path and target URL
   */
  validateRequest(
    requestUrl: string,
    backendUrl: string
  ): {
    valid: boolean;
    path?: string;
    targetUrl?: string;
    error?: string;
  } {
    const path = this.extractPath(requestUrl);
    const url = new URL(requestUrl);
    const searchParams = url.search;

    // Check if path is allowed
    if (!this.isPathAllowed(path)) {
      return {
        valid: false,
        error: 'Path not allowed',
      };
    }

    // Build target URL
    const targetUrl = this.buildTargetUrl(backendUrl, path, searchParams);

    // Validate target URL
    if (!this.validateTargetUrl(targetUrl, backendUrl)) {
      return {
        valid: false,
        error: 'Invalid target URL',
      };
    }

    return {
      valid: true,
      path,
      targetUrl,
    };
  }
}

// Singleton instance
export const ssrfProtection = new SSRFProtectionService();
