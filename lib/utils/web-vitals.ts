/**
 * Web Vitals Tracking Utility
 * Tracks Core Web Vitals và performance metrics
 */

export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
}

export interface PerformanceMetrics {
  renderTime?: number;
  providerMountTime?: number;
  hydrationTime?: number;
}

/**
 * Log Web Vitals metrics
 * Có thể integrate với analytics service (Sentry, Google Analytics, etc.)
 */
export function reportWebVitals(metric: WebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', {
      name: metric.name,
      value: `${metric.value.toFixed(2)}ms`,
      rating: metric.rating,
      id: metric.id,
    });
  }

  // Send to analytics service in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with analytics service
    // Example: sendToAnalytics(metric);
    
    // For now, log to console (can be replaced with API call)
    if (typeof window !== 'undefined' && 'navigator' in window) {
      // You can send to your analytics endpoint here
      // fetch('/api/analytics/web-vitals', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metric),
      // });
    }
  }
}

/**
 * Measure provider render time
 */
export function measureProviderRender(
  providerName: string,
  startTime: number
): number {
  const endTime = performance.now();
  const renderTime = endTime - startTime;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${providerName} render time: ${renderTime.toFixed(2)}ms`);
  }

  return renderTime;
}

/**
 * Get performance rating based on metric value
 */
export function getPerformanceRating(
  value: number,
  thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Core Web Vitals thresholds
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 }, // First Input Delay
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  INP: { good: 200, poor: 500 }, // Interaction to Next Paint
} as const;
