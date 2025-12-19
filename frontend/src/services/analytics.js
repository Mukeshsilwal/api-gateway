/**
 * Marketing & Analytics Service Layer (Adapter Pattern)
 * Wraps vendor SDKs to prevent vendor lock-in and ensure type safety.
 */

// Environment check
const isDev = import.meta.env.DEV;
const ANALYTICS_ID = import.meta.env.VITE_ANALYTICS_ID || 'UA-XXXXX-Y';

/**
 * Initialize the Analytics SDK
 * @param {string} trackingId - The Tracking ID (e.g., GA Measure ID)
 */
export const initAnalytics = (trackingId = ANALYTICS_ID) => {
  try {
    if (isDev) {
      console.log(`[Analytics] Init with ID: ${trackingId}`);
      return;
    }

    // Example: Google Analytics 4 (GA4) Initialization
    // This is where you would inject the script tag dynamically if not present
    /*
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', trackingId);
    window.gtag = gtag; // Expose to window for other methods if needed
    */
    
    console.log('[Analytics] Production Init (Simulated)');

  } catch (error) {
    console.warn('[Analytics] Failed to initialize:', error);
  }
};

/**
 * Track a Page View
 * @param {string} path - The current path (e.g., '/home')
 */
export const trackPageView = (path) => {
  try {
    if (isDev) {
      console.log(`[Analytics] Page View: ${path}`);
      return;
    }

    // Vendor specific call
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: path,
      });
    }
  } catch (error) {
    console.warn('[Analytics] Failed to track page view:', error);
  }
};

/**
 * Track a Custom Event
 * @param {string} eventName - Name of the event (e.g., 'login', 'purchase')
 * @param {Object} properties - Additional metadata
 */
export const trackEvent = (eventName, properties = {}) => {
  try {
    if (isDev) {
      console.log(`[Analytics] Event: ${eventName}`, properties);
      return;
    }

    // Vendor specific call
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }
  } catch (error) {
    console.warn(`[Analytics] Failed to track event ${eventName}:`, error);
  }
};

/**
 * Identify a User
 * @param {string} userId - Unique User ID
 * @param {Object} traits - User traits (email, role, etc.)
 */
export const identifyUser = (userId, traits = {}) => {
  try {
    if (isDev) {
      console.log(`[Analytics] Identify User: ${userId}`, traits);
      return;
    }

    // Vendor specific call
    if (window.gtag) {
        window.gtag('config', ANALYTICS_ID, {
            'user_id': userId,
            ...traits
        });
    }

  } catch (error) {
    console.warn('[Analytics] Failed to identify user:', error);
  }
};

export default {
  init: initAnalytics,
  trackPageView,
  trackEvent,
  identifyUser,
};
