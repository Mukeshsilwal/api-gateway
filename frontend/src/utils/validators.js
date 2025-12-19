/**
 * Input Validation and Sanitization Utilities
 * Production-ready validators for user inputs
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
};

/**
 * Validate phone number (supports various formats)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone
 */
export const isValidPhone = (phone) => {
    if (!phone) return false;
    const phoneStr = String(phone).replace(/[\s()-]/g, '');
    // Allow 7-15 digits for international numbers
    return /^\+?\d{7,15}$/.test(phoneStr);
};

/**
 * Validate name (allows letters, spaces, hyphens, apostrophes)
 * @param {string} name - Name to validate
 * @returns {boolean} True if valid name
 */
export const isValidName = (name) => {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    // Must be 2-50 characters, letters with spaces/hyphens/apostrophes
    return /^[a-zA-Z\s'-]{2,50}$/.test(trimmed);
};

/**
 * Sanitize string input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
    if (!input || typeof input !== 'string') return '';

    return input
        .trim()
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Validate and sanitize passenger name
 * @param {string} name - Name to validate and sanitize
 * @returns {{ valid: boolean, sanitized: string, error?: string }}
 */
export const validatePassengerName = (name) => {
    const sanitized = sanitizeInput(name);

    if (!sanitized) {
        return { valid: false, sanitized: '', error: 'Name is required' };
    }

    if (!isValidName(sanitized)) {
        return {
            valid: false,
            sanitized,
            error: 'Name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes'
        };
    }

    return { valid: true, sanitized };
};

/**
 * Validate and sanitize email
 * @param {string} email - Email to validate and sanitize
 * @returns {{ valid: boolean, sanitized: string, error?: string }}
 */
export const validateEmail = (email) => {
    const sanitized = sanitizeInput(email);

    if (!sanitized) {
        return { valid: false, sanitized: '', error: 'Email is required' };
    }

    if (!isValidEmail(sanitized)) {
        return { valid: false, sanitized, error: 'Please enter a valid email address' };
    }

    return { valid: true, sanitized };
};

/**
 * Validate and sanitize phone number
 * @param {string} phone - Phone to validate and sanitize
 * @returns {{ valid: boolean, sanitized: string, error?: string }}
 */
export const validatePhone = (phone) => {
    const sanitized = String(phone).trim();

    if (!sanitized) {
        return { valid: false, sanitized: '', error: 'Phone number is required' };
    }

    if (!isValidPhone(sanitized)) {
        return {
            valid: false,
            sanitized,
            error: 'Please enter a valid phone number (7-15 digits)'
        };
    }

    return { valid: true, sanitized };
};

/**
 * Validate seat selection
 * @param {Array} seats - Array of seat numbers
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateSeatSelection = (seats) => {
    if (!Array.isArray(seats) || seats.length === 0) {
        return { valid: false, error: 'Please select at least one seat' };
    }

    if (seats.length > 10) {
        return { valid: false, error: 'Maximum 10 seats can be selected at once' };
    }

    return { valid: true };
};

/**
 * Validate booking form data
 * @param {Object} formData - Form data to validate
 * @returns {{ valid: boolean, errors: Object }}
 */
export const validateBookingForm = (formData) => {
    const errors = {};

    const nameValidation = validatePassengerName(formData.name);
    if (!nameValidation.valid) {
        errors.name = nameValidation.error;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
        errors.email = emailValidation.error;
    }

    const phoneValidation = validatePhone(formData.contact);
    if (!phoneValidation.valid) {
        errors.contact = phoneValidation.error;
    }

    const seatsValidation = validateSeatSelection(formData.selectedSeats);
    if (!seatsValidation.valid) {
        errors.seats = seatsValidation.error;
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
        sanitized: {
            name: nameValidation.sanitized,
            email: emailValidation.sanitized,
            contact: phoneValidation.sanitized
        }
    };
};

export default {
    isValidEmail,
    isValidPhone,
    isValidName,
    sanitizeInput,
    validatePassengerName,
    validateEmail,
    validatePhone,
    validateSeatSelection,
    validateBookingForm
};
