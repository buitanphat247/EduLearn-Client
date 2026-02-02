/**
 * Error logging utility
 * @module lib/utils/errorLogger
 * @description Centralized error logging với support cho multiple services (Sentry, Google Analytics, custom endpoint)
 */

/**
 * Error context information
 * @interface ErrorContext
 */
interface ErrorContext {
  /** React component stack trace */
  componentStack?: string;
  /** User ID who encountered the error */
  userId?: string | number;
  /** Pathname where error occurred */
  pathname?: string;
  /** User agent string */
  userAgent?: string;
  /** ISO timestamp of error */
  timestamp?: string;
  /** Route name where error occurred */
  route?: string;
  /** Additional context properties */
  [key: string]: any;
}

/**
 * Log error to multiple services
 * @param {Error} error - Error object to log
 * @param {React.ErrorInfo} [errorInfo] - React error info with component stack
 * @param {ErrorContext} [context] - Additional error context
 * @description 
 * Logs errors to:
 * - Console (development only)
 * - Sentry (if available)
 * - Google Analytics (if available)
 * - Custom analytics endpoint
 * 
 * @example
 * ```typescript
 * logError(error, errorInfo, {
 *   pathname: '/admin/users',
 *   userId: 123,
 *   route: 'admin'
 * });
 * ```
 */
export const logError = (
  error: Error,
  errorInfo?: React.ErrorInfo,
  context?: ErrorContext
) => {
  const errorContext = {
    ...context,
    componentStack: errorInfo?.componentStack,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  };

  // Development: Log to console với full details
  if (process.env.NODE_ENV === 'development') {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    console.error('Error Context:', errorContext);
  }

  // Production: Send to error tracking service
  if (typeof window !== 'undefined') {
    // Sentry
    if ((window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo?.componentStack,
          },
        },
        tags: {
          errorBoundary: true,
        },
        extra: context,
      });
    }

    // Optional: Send to custom analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }

    // Optional: Send to custom analytics endpoint
    try {
      fetch('/api/analytics/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorContext),
      }).catch(() => {
        // Silent fail - analytics is non-critical
      });
    } catch {
      // Silent fail
    }
  }
};
