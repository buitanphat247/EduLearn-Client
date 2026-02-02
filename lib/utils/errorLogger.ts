/**
 * Error logging utility
 * Centralized error logging với support cho multiple services
 */

interface ErrorContext {
  componentStack?: string;
  userId?: string | number;
  pathname?: string;
  userAgent?: string;
  timestamp?: string;
  route?: string;
  [key: string]: any;
}

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
