/**
 * Analytics Utility
 * Track events và page views
 */

interface AnalyticsEvent {
  event_name: string;
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: any;
}

/**
 * Track 404 page với referrer URL
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
