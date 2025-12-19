/**
 * Error Utilities
 * Provides functions to parse and format backend error responses
 * Backend format: { code, message, data }
 */

/**
 * Error categories
 */
export const ErrorType = {
    VALIDATION: 'validation',
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    NOT_FOUND: 'not_found',
    SERVER: 'server',
    NETWORK: 'network',
    TIMEOUT: 'timeout',
    RATE_LIMIT: 'rate_limit',
    UNKNOWN: 'unknown',
};

/**
 * Parse error object and extract structured information
 * @param {Error} error - Error object from API service
 * @returns {Object} Parsed error information
 */
export function parseError(error) {
    if (!error) {
        return {
            type: ErrorType.UNKNOWN,
            message: 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR',
            details: null,
            fieldErrors: null,
        };
    }

    const parsed = {
        type: getErrorType(error),
        message: getErrorMessage(error),
        code: error.data?.code || error.code || 'UNKNOWN_ERROR',
        details: error.details || error.data || null,
        fieldErrors: getFieldErrors(error),
        status: error.status || 0,
    };

    return parsed;
}

/**
 * Get error type/category based on status code and error properties
 * @param {Error} error - Error object
 * @returns {string} Error type from ErrorType enum
 */
export function getErrorType(error) {
    if (!error) return ErrorType.UNKNOWN;

    // Check for specific error indicators
    if (error.isTimeout) return ErrorType.TIMEOUT;
    if (!error.response && !error.status) return ErrorType.NETWORK;

    const status = error.status || error.response?.status;

    if (status === 400) return ErrorType.VALIDATION;
    if (status === 401) return ErrorType.AUTHENTICATION;
    if (status === 403) return ErrorType.AUTHORIZATION;
    if (status === 404) return ErrorType.NOT_FOUND;
    if (status === 429) return ErrorType.RATE_LIMIT;
    if (status >= 500) return ErrorType.SERVER;

    return ErrorType.UNKNOWN;
}

/**
 * Extract user-friendly error message
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error) {
    if (!error) return 'An unexpected error occurred';

    // Priority order for message extraction
    if (error.message) return error.message;
    if (error.data?.message) return error.data.message;
    if (error.response?.statusText) return error.response.statusText;

    // Default messages based on error type
    const type = getErrorType(error);
    return getDefaultMessageForType(type);
}

/**
 * Get default message for error type
 * @param {string} type - Error type
 * @returns {string} Default error message
 */
function getDefaultMessageForType(type) {
    const messages = {
        [ErrorType.VALIDATION]: 'Please check your input and try again',
        [ErrorType.AUTHENTICATION]: 'Invalid credentials. Please try again',
        [ErrorType.AUTHORIZATION]: 'You do not have permission to perform this action',
        [ErrorType.NOT_FOUND]: 'The requested resource was not found',
        [ErrorType.SERVER]: 'Server error. Please try again later',
        [ErrorType.NETWORK]: 'Network error. Please check your connection',
        [ErrorType.TIMEOUT]: 'Request timeout. Please try again',
        [ErrorType.RATE_LIMIT]: 'Too many requests. Please wait and try again',
        [ErrorType.UNKNOWN]: 'An unexpected error occurred',
    };

    return messages[type] || messages[ErrorType.UNKNOWN];
}

/**
 * Extract field-specific validation errors
 * @param {Error} error - Error object
 * @returns {Object|null} Object with field names as keys and error messages as values
 */
export function getFieldErrors(error) {
    if (!error) return null;

    const details = error.details || (error.data && error.data.data) || error.data;
    if (!details) return null;

    // Check for various possible field error formats
    if (details.fieldErrors) {
        return details.fieldErrors;
    }

    if (details.validationErrors) {
        return formatValidationErrors(details.validationErrors);
    }

    // If details is already an object with field names
    if (typeof details === 'object' && !Array.isArray(details)) {
        // Filter out non-field error properties
        const fieldErrors = {};
        for (const [key, value] of Object.entries(details)) {
            if (typeof value === 'string' && !['code', 'message'].includes(key)) {
                fieldErrors[key] = value;
            }
        }
        return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
    }

    return null;
}

/**
 * Format validation errors from array to object
 * @param {Array} errors - Array of validation error objects
 * @returns {Object} Object with field names as keys
 */
export function formatValidationErrors(errors) {
    if (!Array.isArray(errors)) return {};

    const formatted = {};
    errors.forEach((error) => {
        if (error.field && error.message) {
            formatted[error.field] = error.message;
        } else if (error.property && error.constraints) {
            // Handle class-validator format
            const messages = Object.values(error.constraints);
            formatted[error.property] = messages[0] || 'Invalid value';
        }
    });

    return formatted;
}

/**
 * Check if error is recoverable (can retry)
 * @param {Error} error - Error object
 * @returns {boolean} True if error is recoverable
 */
export function isRecoverableError(error) {
    const type = getErrorType(error);
    return [
        ErrorType.NETWORK,
        ErrorType.TIMEOUT,
        ErrorType.RATE_LIMIT,
        ErrorType.SERVER,
    ].includes(type);
}

/**
 * Get recovery suggestion for error
 * @param {Error} error - Error object
 * @returns {string|null} Recovery suggestion or null
 */
export function getRecoverySuggestion(error) {
    const type = getErrorType(error);

    const suggestions = {
        [ErrorType.NETWORK]: 'Please check your internet connection and try again',
        [ErrorType.TIMEOUT]: 'The request timed out. Please try again',
        [ErrorType.RATE_LIMIT]: 'Too many requests. Please wait a moment before trying again',
        [ErrorType.SERVER]: 'Server is experiencing issues. Please try again in a few minutes',
        [ErrorType.AUTHENTICATION]: 'Please login again to continue',
        [ErrorType.AUTHORIZATION]: 'You may need to request access from an administrator',
    };

    return suggestions[type] || null;
}

/**
 * Log error with appropriate level
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 */
export function logError(error, context = '') {
    const parsed = parseError(error);
    const prefix = context ? `[${context}]` : '';

    if (parsed.type === ErrorType.SERVER || parsed.type === ErrorType.UNKNOWN) {
        console.error(`${prefix} Error:`, {
            type: parsed.type,
            message: parsed.message,
            code: parsed.code,
            status: parsed.status,
            details: parsed.details,
        });
    } else {
        console.warn(`${prefix} Error:`, {
            type: parsed.type,
            message: parsed.message,
            code: parsed.code,
        });
    }
}

/**
 * Format error for display in forms
 * @param {Error} error - Error object
 * @returns {Object} Object with main message and field errors
 */
export function formatErrorForForm(error) {
    const parsed = parseError(error);
    return {
        message: parsed.message,
        fieldErrors: parsed.fieldErrors || {},
        hasfieldErrors: !!parsed.fieldErrors,
        recoverySuggestion: getRecoverySuggestion(error),
    };
}
