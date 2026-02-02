/**
 * API Proxy Cache Utility
 * In-memory cache để giảm latency từ 300-600ms xuống 20-50ms
 * 
 * Strategy:
 * - GET requests: Cache 30-60s
 * - Public/semi-public data: Cache longer
 * - User-specific data: Cache shorter hoặc không cache
 */

interface CacheEntry {
  data: string;
  timestamp: number;
  expiresAt: number;
  headers: Record<string, string>;
}

class ProxyCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 1000; // Max 1000 entries
  private defaultTTL: number = 60; // 60 seconds default

  /**
   * Generate cache key from request
   */
  private generateKey(
    method: string,
    path: string,
    searchParams: string,
    userId?: string
  ): string {
    // Include userId for user-specific data
    const userPart = userId ? `:user:${userId}` : '';
    return `proxy:${method}:${path}:${searchParams}${userPart}`;
  }

  /**
   * Check if path should be cached
   */
  private shouldCache(path: string, method: string): boolean {
    // Only cache GET requests
    if (method !== 'GET') return false;

    // Cache these paths (public/semi-public data)
    const cacheablePaths = [
      '/news',
      '/events',
      '/vocabulary',
      '/classes', // Public class list
      '/stats', // Public stats
    ];

    // Don't cache these paths (user-specific, sensitive)
    const nonCacheablePaths = [
      '/auth',
      '/users', // User-specific
      '/friends', // User-specific
      '/assignment-attachments', // User-specific
    ];

    // Check non-cacheable first
    if (nonCacheablePaths.some(p => path.startsWith(p))) {
      return false;
    }

    // Check cacheable
    return cacheablePaths.some(p => path.startsWith(p));
  }

  /**
   * Get TTL based on path
   */
  private getTTL(path: string): number {
    // Public data: cache longer
    if (path.startsWith('/news') || path.startsWith('/events')) {
      return 300; // 5 minutes
    }

    // Semi-public data: cache medium
    if (path.startsWith('/vocabulary') || path.startsWith('/classes')) {
      return 60; // 1 minute
    }

    // Default: 30 seconds
    return 30;
  }

  /**
   * Get cached response
   */
  get(
    method: string,
    path: string,
    searchParams: string,
    userId?: string
  ): { data: string; headers: Record<string, string> } | null {
    if (!this.shouldCache(path, method)) {
      return null;
    }

    const key = this.generateKey(method, path, searchParams, userId);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return {
      data: entry.data,
      headers: {
        ...entry.headers,
        'X-Cache': 'HIT',
        'X-Cache-Age': Math.floor((Date.now() - entry.timestamp) / 1000).toString(),
      },
    };
  }

  /**
   * Set cached response
   */
  set(
    method: string,
    path: string,
    searchParams: string,
    data: string,
    responseHeaders: Headers,
    userId?: string
  ): void {
    if (!this.shouldCache(path, method)) {
      return;
    }

    // Clean up if cache is too large
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    const key = this.generateKey(method, path, searchParams, userId);
    const ttl = this.getTTL(path);
    const now = Date.now();

    // Extract relevant headers
    const headers: Record<string, string> = {
      'Content-Type': responseHeaders.get('content-type') || 'application/json',
    };

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl * 1000,
      headers,
    });
  }

  /**
   * Invalidate cache for a path pattern
   */
  invalidate(pathPattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pathPattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let deleted = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        deleted++;
      }
    }

    // If still too large, delete oldest 20%
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toDelete = Math.floor(this.cache.size * 0.2);
      for (let i = 0; i < toDelete; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Singleton instance
export const proxyCache = new ProxyCache();

// Auto cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    proxyCache['cleanup']();
  }, 5 * 60 * 1000);
}
