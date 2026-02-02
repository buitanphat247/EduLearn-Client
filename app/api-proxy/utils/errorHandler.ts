import { NextResponse } from 'next/server';

/**
 * Create consistent error response for API proxy routes
 * @param message - Error message
 * @param status - HTTP status code (default: 500)
 * @param error - Optional error object for development
 * @returns NextResponse with consistent error format
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  error?: unknown
): NextResponse {
  const errorResponse: {
    status: false;
    message: string;
    data: null;
    error?: string;
  } = {
    status: false,
    message,
    data: null,
  };

  // Include error details in development mode
  if (process.env.NODE_ENV === 'development' && error) {
    errorResponse.error =
      error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(errorResponse, { status });
}

/**
 * Log error with context for monitoring
 * @param error - Error object
 * @param context - Context information (route, method, etc.)
 */
export function logError(
  error: unknown,
  context: { route: string; method: string }
): void {
  const errorInfo = {
    route: context.route,
    method: context.method,
    error: error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : String(error),
    timestamp: new Date().toISOString(),
  };

  // In production, send to monitoring service (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with monitoring service
    // Sentry.captureException(error, { extra: errorInfo });
    console.error('API Proxy Error:', errorInfo);
  } else {
    console.error('API Proxy Error:', errorInfo);
  }
}

/**
 * Handle fetch errors and return appropriate error response
 * @param error - Error from fetch
 * @param route - Route path for logging
 * @param method - HTTP method for logging
 * @returns NextResponse with error
 */
export function handleFetchError(
  error: unknown,
  route: string,
  method: string
): NextResponse {
  logError(error, { route, method });

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return createErrorResponse('Request timeout', 504, error);
    }
    if (
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('Failed to fetch')
    ) {
      return createErrorResponse('Backend connection failed', 503, error);
    }
  }

  return createErrorResponse('Internal server error', 500, error);
}
