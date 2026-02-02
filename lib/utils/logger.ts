/**
 * Structured logging utility for client and server components
 * Provides consistent logging format and ready for monitoring service integration
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: unknown;
}

/**
 * Log entry structure
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  environment: string;
}

/**
 * Create a structured log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext
): LogEntry {
  return {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  };
}

/**
 * Logger utility class
 */
class Logger {
  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      const entry = createLogEntry("debug", message, context);
      console.debug("[Logger] Debug:", entry);
    }
    // In production, can send to monitoring service
    // Example: monitoringService.log(entry);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    const entry = createLogEntry("info", message, context);
    if (process.env.NODE_ENV === "development") {
      console.log("[Logger] Info:", entry);
    }
    // In production, send to monitoring service
    // Example: monitoringService.log(entry);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    const entry = createLogEntry("warn", message, context);
    console.warn("[Logger] Warning:", entry);
    // In production, send to monitoring service
    // Example: monitoringService.log(entry);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext: LogContext = {
      ...context,
      error: error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : String(error),
    };

    const entry = createLogEntry("error", message, errorContext);
    console.error("[Logger] Error:", entry);

    // In production, send to error tracking service (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === "production") {
      // TODO: Integrate with error tracking service
      // Example: Sentry.captureException(error, { extra: errorContext });
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export Logger class for custom instances if needed
export { Logger };
