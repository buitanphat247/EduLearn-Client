/**
 * Cookie Filtering Service
 * Handles filtering and sanitization of cookies for security
 */

import { ALLOWED_COOKIE_NAMES } from '../constants';

/**
 * Cookie Filter Service
 * Filters cookies to only forward allowed cookies to backend
 */
export class CookieFilterService {
  /**
   * Filter cookies to only include allowed cookie names
   * @param cookieHeader - Cookie header string from request
   * @returns Filtered cookie string with only allowed cookies
   */
  filterCookies(cookieHeader: string | null): string {
    if (!cookieHeader) {
      return '';
    }

    const cookies = cookieHeader.split(';').map(c => c.trim());
    const filtered = cookies
      .filter(cookie => {
        const name = cookie.split('=')[0].trim();
        return (ALLOWED_COOKIE_NAMES as readonly string[]).includes(name);
      })
      .map(cookie => {
        // Handle URL-encoded cookie values
        const [name, ...valueParts] = cookie.split('=');
        const value = valueParts.join('='); // Rejoin in case value contains '='
        if (value) {
          try {
            // Decode URL-encoded cookie value to ensure backend receives correct format
            const decodedValue = decodeURIComponent(value);
            return `${name.trim()}=${decodedValue}`;
          } catch {
            // If decode fails, return as-is
            return cookie;
          }
        }
        return cookie;
      });

    return filtered.join('; ');
  }

  /**
   * Extract user ID from cookie
   * @param cookieHeader - Cookie header string
   * @returns User ID if found, undefined otherwise
   */
  extractUserId(cookieHeader: string | null): string | undefined {
    if (!cookieHeader) {
      return undefined;
    }

    try {
      const userMatch = cookieHeader.match(/_u=([^;]+)/);
      return userMatch ? userMatch[1] : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Clean Set-Cookie header to prevent domain/security issues
   * Removes domain, secure, httponly, and samesite attributes
   * @param setCookieHeader - Set-Cookie header value
   * @returns Cleaned Set-Cookie header value
   */
  cleanSetCookie(setCookieHeader: string): string {
    return setCookieHeader
      .replace(/;\s*domain=[^;]*/gi, '')
      .replace(/;\s*secure/gi, '')
      .replace(/;\s*httponly/gi, '')
      .replace(/;\s*samesite=[^;]*/gi, '');
  }

  /**
   * Extract all Set-Cookie headers from response
   * @param response - Fetch Response object
   * @returns Array of Set-Cookie header values
   */
  extractSetCookies(response: Response): string[] {
    const setCookies: string[] = [];

    // Try modern getSetCookie() method first
    if (typeof response.headers.getSetCookie === 'function') {
      return response.headers.getSetCookie();
    }

    // Fallback: iterate through headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        setCookies.push(value);
      }
    });

    return setCookies;
  }

  /**
   * Process and clean all Set-Cookie headers from response
   * @param response - Fetch Response object
   * @returns Array of cleaned Set-Cookie header values
   */
  processSetCookies(response: Response): string[] {
    const setCookies = this.extractSetCookies(response);
    return setCookies.map(cookie => this.cleanSetCookie(cookie));
  }
}

// Singleton instance
export const cookieFilter = new CookieFilterService();
