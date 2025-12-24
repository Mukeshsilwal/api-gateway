import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * FieldError Component
 * Displays validation errors for form fields
 * 
 * @param {Object} props
 * @param {string} props.error - Error message to display
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.show - Whether to show the error (default: true if error exists)
 */
export default function FieldError({ error, className = '', show }) {
    const shouldShow = show !== undefined ? show : !!error;

    if (!shouldShow || !error) {
        return null;
    }

    return (
        <div
            className={`flex items-start gap-1.5 mt-1.5 text-sm text-red-600 dark:text-red-400 animate-fadeIn ${className}`}
            role="alert"
        >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
        </div>
    );
}

/**
 * FieldErrorList Component
 * Displays multiple validation errors
 * 
 * @param {Object} props
 * @param {Array<string>} props.errors - Array of error messages
 * @param {string} props.className - Additional CSS classes
 */
export function FieldErrorList({ errors, className = '' }) {
    if (!errors || errors.length === 0) {
        return null;
    }

    return (
        <div className={`mt-2 space-y-1 ${className}`}>
            {errors.map((error, index) => (
                <FieldError key={index} error={error} />
            ))}
        </div>
    );
}

/**
 * FormError Component
 * Displays general form-level errors (not field-specific)
 * 
 * @param {Object} props
 * @param {string} props.message - Error message to display
 * @param {string} props.suggestion - Optional recovery suggestion
 * @param {string} props.className - Additional CSS classes
 */
export function FormError({ message, suggestion, className = '' }) {
    if (!message) {
        return null;
    }

    return (
        <div
            className={`p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-900/50 animate-fadeIn ${className}`}
            role="alert"
        >
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">{message}</p>
                    {suggestion && (
                        <p className="mt-1 text-sm text-red-700 dark:text-red-300">{suggestion}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
