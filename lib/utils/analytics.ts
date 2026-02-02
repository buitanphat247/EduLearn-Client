/**
 * Analytics Utility
 * @module lib/utils/analytics
 * @description Track events and page views with support for Google Analytics and custom endpoints
 */

/**
 * Analytics event structure
 * @interface AnalyticsEvent
 */
interface AnalyticsEvent {
  /** Event name (e.g., 'page_not_found', 'button_click') */
  event_name: string;
  /** Event category for grouping */
  event_category?: string;
  /** Event label for additional context */
  event_label?: string;
  /** Numeric value associated with event */
  value?: number;
  /** Additional event properties */
  [key: string]: any;
}

/**
 * Track 404 page với referrer URL
 * @param {string} pathname - Path that was not found
 * @param {string} [referrer] - Optional referrer URL (defaults to document.referrer)
 * @description Tracks 404 pages with referrer information to identify broken links
 * 
 * @example
 * ```typescript
 * track404('/invalid-page', 'https://example.com/old-link');
 * ```
 */
export function track404(pathname: string, referrer?: string) {
  if (typeof window === 'undefined') return;

  const event: AnalyticsEvent = {
    event_name: 'page_not_found',
    event_category: 'Error',
    event_label: pathname,
    page_path: pathname,
    referrer: referrer || document.referrer || 'direct',
    timestamp: new Date().toISOString(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] 404 Page:', event);
  }

  // Send to analytics service in production
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_not_found', {
        event_category: 'Error',
        event_label: pathname,
        page_path: pathname,
        referrer: referrer || document.referrer || 'direct',
      });
    }

    // Custom analytics endpoint (optional)
    try {
      fetch('/api/analytics/404', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(() => {
        // Silent fail - analytics is non-critical
      });
    } catch {
      // Silent fail
    }
  }
}

/**
 * Track custom event
 * @param {AnalyticsEvent} event - Event object with name, category, label, and value
 * @description Tracks custom events to analytics services (Google Analytics, custom endpoint)
 * 
 * @example
 * ```typescript
 * trackEvent({
 *   event_name: 'button_click',
 *   event_category: 'User Interaction',
 *   event_label: 'Submit Button',
 *   value: 1
 * });
 * ```
 */
export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return;

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Event:', event);
  }

  // Send to analytics service in production
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.event_name, {
        event_category: event.event_category,
        event_label: event.event_label,
        value: event.value,
      });
    }
  }
}
