/**
 * Rate Limiting Service
 * Handles rate limiting logic for API proxy requests
 */

import { RATE_LIMIT } from '../constants';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * Rate Limiter Service
 * In-memory rate limiting với configurable limits
 */
export class RateLimiterService {
  private rateLimitMap: Map<string, RateLimitRecord> = new Map();

  /**
   * Check rate limit for a given identifier
   * @param identifier - Unique identifier (e.g., IP address)
   * @param maxRequests - Maximum requests allowed (default from constants)
   * @param windowMs - Time window in milliseconds (default from constants)
   * @returns Rate limit result with success status and info
   */
  checkRateLimit(
    identifier: string,
    maxRequests: number = RATE_LIMIT.MAX_REQUESTS,
    windowMs: number = RATE_LIMIT.WINDOW_MS
  ): RateLimitResult {
    const now = Date.now();
    const record = this.rateLimitMap.get(identifier);

    // No record or expired - create new record
    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        reset: Math.ceil(windowMs / 1000),
      };
    }

    // Rate limit exceeded
    if (record.count >= maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: Math.ceil((record.resetTime - now) / 1000),
      };
    }

    // Increment count
    record.count++;
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - record.count,
      reset: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  /**
   * Get client IP from request headers
   * @param headers - Request headers
   * @returns Client IP address or 'unknown'
   */
  getClientIP(headers: Headers): string {
    const xForwardedFor = headers.get('x-forwarded-for');
    const xRealIP = headers.get('x-real-ip');

    if (xForwardedFor) {
      // Take first IP from X-Forwarded-For header
      return xForwardedFor.split(',')[0]?.trim() || 'unknown';
    }

    if (xRealIP) {
      return xRealIP.trim();
    }

    return 'unknown';
  }

  /**
   * Create rate limit identifier
   * @param prefix - Prefix for identifier (e.g., 'api-proxy')
   * @param ip - Client IP address
   * @returns Rate limit identifier
   */
  createIdentifier(prefix: string, ip: string): string {
    return `${prefix}:${ip}`;
  }

  /**
   * Clear rate limit for a specific identifier
   * @param identifier - Rate limit identifier
   */
  clear(identifier: string): void {
    this.rateLimitMap.delete(identifier);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.rateLimitMap.clear();
  }

  /**
   * Cleanup expired rate limit records
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.rateLimitMap.entries()) {
      if (now > record.resetTime) {
        this.rateLimitMap.delete(key);
      }
    }
  }

  /**
   * Get rate limit stats
   */
  getStats(): {
    totalRecords: number;
    activeRecords: number;
  } {
    const now = Date.now();
    let activeRecords = 0;

    for (const record of this.rateLimitMap.values()) {
      if (now <= record.resetTime) {
        activeRecords++;
      }
    }

    return {
      totalRecords: this.rateLimitMap.size,
      activeRecords,
    };
  }
}

// Singleton instance
export const rateLimiter = new RateLimiterService();

// Auto cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 5 * 60 * 1000);
}
