/**
 * Centralized Logging Utility
 * Environment-aware logging with production safety
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

/**
 * Log levels
 */
const LogLevel = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
};

/**
 * Centralized logger class
 */
class Logger {
    /**
     * Log error message
     * @param {string} message - Error message
     * @param {any} data - Additional data
     */
    static error(message, data = null) {
        console.error(`[ERROR] ${message}`, data || '');

        // In production, send to error tracking service
        if (isProduction && data instanceof Error) {
            this.sendToErrorTracking(message, data);
        }
    }

    /**
     * Log warning message
     * @param {string} message - Warning message
     * @param {any} data - Additional data
     */
    static warn(message, data = null) {
        if (isDevelopment || isProduction) {
            console.warn(`[WARN] ${message}`, data || '');
        }
    }

    /**
     * Log info message (development only)
     * @param {string} message - Info message
     * @param {any} data - Additional data
     */
    static info(message, data = null) {
        if (isDevelopment) {
            // Only log in development
            return;
        }
    }

    /**
     * Log debug message (development only)
     * @param {string} message - Debug message
     * @param {any} data - Additional data
     */
    static debug(message, data = null) {
        if (isDevelopment) {
            // Only log in development
            return;
        }
    }

    /**
     * Log API request
     * @param {string} method - HTTP method
     * @param {string} url - Request URL
     * @param {any} data - Request data
     */
    static apiRequest(method, url, data = null) {
        if (isDevelopment) {
            // Development only
            return;
        }
    }

    /**
     * Log API response
     * @param {string} url - Request URL
     * @param {number} status - Response status
     * @param {any} data - Response data
     */
    static apiResponse(url, status, data = null) {
        if (isDevelopment) {
            // Development only - don't log in production
            return;
        }
    }

    /**
     * Log API error
     * @param {string} url - Request URL
     * @param {Error} error - Error object
     */
    static apiError(url, error) {
        this.error(`API Error: ${url}`, error);
    }

    /**
     * Send error to tracking service (placeholder for future implementation)
     * @param {string} message - Error message
     * @param {Error} error - Error object
     */
    static sendToErrorTracking(message, error) {
        // Placeholder for integrating with error tracking services like:
        // - Sentry
        // - LogRocket
        // - Rollbar
        // - Custom backend logging endpoint

        // Example implementation:
        // try {
        //   await fetch('/api/log-error', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //       message,
        //       error: {
        //         name: error.name,
        //         message: error.message,
        //         stack: error.stack
        //       },
        //       timestamp: new Date().toISOString(),
        //       userAgent: navigator.userAgent
        //     })
        //   });
        // } catch (err) {
        //   console.error('Failed to send error to tracking service:', err);
        // }
    }

    /**
     * Log performance metric
     * @param {string} metric - Metric name
     * @param {number} value - Metric value
     */
    static performance(metric, value) {
        if (isDevelopment) {
            // Development only
            return;
        }

        // In production, you might want to send to analytics
        if (isProduction && window.performance) {
            // Example: Send to analytics service
        }
    }
}

/**
 * Create a scoped logger for a specific module
 * @param {string} scope - Module or component name
 * @returns {Object} Scoped logger
 */
export const createLogger = (scope) => {
    return {
        error: (message, data) => Logger.error(`[${scope}] ${message}`, data),
        warn: (message, data) => Logger.warn(`[${scope}] ${message}`, data),
        info: (message, data) => Logger.info(`[${scope}] ${message}`, data),
        debug: (message, data) => Logger.debug(`[${scope}] ${message}`, data)
    };
};

export { Logger, LogLevel };
export default Logger;
