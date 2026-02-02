/**
 * Application Configuration
 * @module app/config/appConfig
 * @description Centralized configuration with environment variable support and validation
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  /** Base URL for API requests (from environment or default) */
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1611/api',
  /** API proxy path for client-side requests */
  PROXY_PATH: '/api-proxy',
  /** Request timeout in milliseconds */
  TIMEOUT_MS: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS) || 30000,
  /** Enable request caching */
  ENABLE_CACHE: process.env.NEXT_PUBLIC_ENABLE_API_CACHE !== 'false',
} as const;

/**
 * Cache Configuration
 */
export const CACHE_CONFIG = {
  /** Cache TTL in milliseconds */
  TTL: Number(process.env.NEXT_PUBLIC_CACHE_TTL_MS) || 30000,
  /** Maximum cache size */
  MAX_SIZE: Number(process.env.NEXT_PUBLIC_CACHE_MAX_SIZE) || 50,
  /** Cache cleanup threshold */
  CLEANUP_THRESHOLD: Number(process.env.NEXT_PUBLIC_CACHE_CLEANUP_THRESHOLD) || 40,
} as const;

/**
 * Auth Configuration
 */
export const AUTH_CONFIG = {
  /** Auth header cache TTL in milliseconds */
  CACHE_TTL: Number(process.env.NEXT_PUBLIC_AUTH_CACHE_TTL_MS) || 5000,
  /** Refresh token queue max size */
  MAX_QUEUE_SIZE: Number(process.env.NEXT_PUBLIC_AUTH_MAX_QUEUE_SIZE) || 500,
  /** Queue timeout in milliseconds */
  QUEUE_TIMEOUT: Number(process.env.NEXT_PUBLIC_AUTH_QUEUE_TIMEOUT_MS) || 30000,
} as const;

/**
 * Cookie Configuration
 */
export const COOKIE_CONFIG = {
  /** Cookie cache duration in milliseconds */
  CACHE_DURATION: Number(process.env.NEXT_PUBLIC_COOKIE_CACHE_DURATION_MS) || 100,
  /** Parsed cookies cache duration in milliseconds */
  PARSED_CACHE_DURATION: Number(process.env.NEXT_PUBLIC_COOKIE_PARSED_CACHE_DURATION_MS) || 50,
  /** Maximum cache size for parsed cookies */
  MAX_CACHE_SIZE: Number(process.env.NEXT_PUBLIC_COOKIE_MAX_CACHE_SIZE) || 100,
} as const;

/**
 * Validate configuration values
 * @throws {Error} If configuration values are invalid
 */
export function validateConfig(): void {
  const errors: string[] = [];

  // Validate API config
  if (API_CONFIG.TIMEOUT_MS <= 0) {
    errors.push('API_TIMEOUT_MS must be greater than 0');
  }

  // Validate cache config
  if (CACHE_CONFIG.TTL <= 0) {
    errors.push('CACHE_TTL must be greater than 0');
  }
  if (CACHE_CONFIG.MAX_SIZE <= 0) {
    errors.push('CACHE_MAX_SIZE must be greater than 0');
  }
  if (CACHE_CONFIG.CLEANUP_THRESHOLD >= CACHE_CONFIG.MAX_SIZE) {
    errors.push('CACHE_CLEANUP_THRESHOLD must be less than CACHE_MAX_SIZE');
  }

  // Validate auth config
  if (AUTH_CONFIG.CACHE_TTL <= 0) {
    errors.push('AUTH_CACHE_TTL must be greater than 0');
  }
  if (AUTH_CONFIG.MAX_QUEUE_SIZE <= 0) {
    errors.push('AUTH_MAX_QUEUE_SIZE must be greater than 0');
  }
  if (AUTH_CONFIG.QUEUE_TIMEOUT <= 0) {
    errors.push('AUTH_QUEUE_TIMEOUT must be greater than 0');
  }

  // Validate cookie config
  if (COOKIE_CONFIG.CACHE_DURATION <= 0) {
    errors.push('COOKIE_CACHE_DURATION must be greater than 0');
  }
  if (COOKIE_CONFIG.MAX_CACHE_SIZE <= 0) {
    errors.push('COOKIE_MAX_CACHE_SIZE must be greater than 0');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

// Validate config on module load (only in development)
if (process.env.NODE_ENV === 'development') {
  try {
    validateConfig();
  } catch (error) {
    console.warn('[Config] Configuration validation warning:', error);
  }
}
