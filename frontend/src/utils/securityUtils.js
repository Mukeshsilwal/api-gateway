/**
 * Security Utilities
 * Secure data handling and storage
 */

import authService from '../services/authService';

/**
 * Secure localStorage wrapper with encryption consideration
 */
class SecureStorage {
    /**
     * Set item in localStorage with validation
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     */
    static setItem(key, value) {
        try {
            if (!key) {
                console.error('Storage key is required');
                return false;
            }

            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Error storing data:', error);
            return false;
        }
    }

    /**
     * Get item from localStorage with validation
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if not found
     * @returns {any} Retrieved value or default
     */
    static getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;

            // Try to parse as JSON, if it fails return as string
            try {
                return JSON.parse(item);
            } catch {
                return item;
            }
        } catch (error) {
            console.error('Error retrieving data:', error);
            return defaultValue;
        }
    }

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     */
    static removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing data:', error);
            return false;
        }
    }

    /**
     * Clear all localStorage
     */
    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        // JWT tokens have 3 parts separated by dots
        const parts = token.split('.');
        if (parts.length !== 3) return true;

        // Decode the payload (second part)
        const payload = JSON.parse(atob(parts[1]));

        // Check expiration (exp is in seconds, Date.now() is in milliseconds)
        if (payload.exp) {
            return Date.now() >= payload.exp * 1000;
        }

        // If no exp field, consider it valid (though not ideal)
        return false;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true;
    }
};

/**
 * Validate session and redirect if invalid
 * @param {function} navigate - React Router navigate function
 * @param {string} redirectPath - Path to redirect if session invalid
 * @returns {boolean} True if session is valid
 */
export const validateSession = (navigate, redirectPath = '/login') => {
    const token = authService.getToken();

    if (!token) {
        navigate(redirectPath);
        return false;
    }

    if (isTokenExpired(token)) {
        authService.logout();
        navigate(redirectPath);
        return false;
    }

    return true;
};

/**
 * Sanitize URL to prevent open redirect vulnerabilities
 * @param {string} url - URL to sanitize
 * @param {string} allowedDomain - Allowed domain for redirects
 * @returns {string} Sanitized URL or default
 */
export const sanitizeRedirectUrl = (url, allowedDomain = window.location.origin) => {
    if (!url) return '/';

    try {
        const urlObj = new URL(url, window.location.origin);

        // Only allow same-origin redirects by default
        if (urlObj.origin !== allowedDomain) {
            console.warn('Prevented redirect to external domain:', url);
            return '/';
        }

        return urlObj.pathname + urlObj.search;
    } catch (error) {
        console.error('Invalid redirect URL:', error);
        return '/';
    }
};

/**
 * Generate a secure random ID
 * @param {number} length - Length of the ID
 * @returns {string} Random ID
 */
export const generateSecureId = (length = 16) => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Mask sensitive data for display
 * @param {string} data - Data to mask
 * @param {number} visibleChars - Number of characters to show at start and end
 * @returns {string} Masked data
 */
export const maskSensitiveData = (data, visibleChars = 4) => {
    if (!data || data.length <= visibleChars * 2) return data;

    const start = data.slice(0, visibleChars);
    const end = data.slice(-visibleChars);
    const masked = '*'.repeat(Math.min(data.length - visibleChars * 2, 10));

    return `${start}${masked}${end}`;
};

/**
 * Remove sensitive data from console logs in production
 * @param {Object} data - Data object
 * @param {Array} sensitiveKeys - Keys to remove
 * @returns {Object} Cleaned data
 */
export const removeSensitiveData = (data, sensitiveKeys = ['password', 'token', 'secret', 'apiKey']) => {
    if (import.meta.env.DEV) {
        return data; // Allow full logging in development
    }

    if (!data || typeof data !== 'object') return data;

    const cleaned = { ...data };

    sensitiveKeys.forEach(key => {
        if (key in cleaned) {
            cleaned[key] = '[REDACTED]';
        }
    });

    return cleaned;
};

export { SecureStorage };

export default {
    SecureStorage,
    isTokenExpired,
    validateSession,
    sanitizeRedirectUrl,
    generateSecureId,
    maskSensitiveData,
    removeSensitiveData
};
