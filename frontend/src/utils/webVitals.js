import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

/**
 * Send Web Vitals metrics to analytics
 * @param {Object} metric - Web Vital metric object
 */
function sendToAnalytics(metric) {
    // Log to console in development
    if (import.meta.env.DEV) {
        console.log(`[Web Vitals] ${metric.name}:`, {
            value: `${Math.round(metric.value)}ms`,
            rating: metric.rating,
            id: metric.id,
        });
        // Skip sending to backend in development
        return;
    }

    // Only send to analytics in production if endpoint exists
    const body = JSON.stringify({
        name: metric.name,
        value: Math.round(metric.value),
        id: metric.id,
        rating: metric.rating,
        navigationType: metric.navigationType,
        timestamp: Date.now(),
    });

    // Use sendBeacon if available (more reliable)
    if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/vitals', body);
    } else {
        // Fallback to fetch with keepalive - silently fail if endpoint doesn't exist
        fetch('/api/analytics/vitals', {
            body,
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
        }).catch(() => {
            // Silently ignore analytics errors
        });
    }
}

/**
 * Initialize Web Vitals reporting
 */
export function reportWebVitals() {
    // Core Web Vitals
    getCLS(sendToAnalytics);  // Cumulative Layout Shift
    getFID(sendToAnalytics);  // First Input Delay
    getLCP(sendToAnalytics);  // Largest Contentful Paint

    // Additional metrics
    getFCP(sendToAnalytics);  // First Contentful Paint
    getTTFB(sendToAnalytics); // Time to First Byte
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics() {
    if (!window.performance) return null;

    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return {
        // Navigation timing
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,

        // Paint timing
        firstPaint: paint?.find(entry => entry.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint?.find(entry => entry.name === 'first-contentful-paint')?.startTime,
    };
}

export default reportWebVitals;
