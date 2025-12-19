/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @param {Function} options.onRetry - Callback on retry (attempt, delay)
 * @returns {Promise} - Result of the function
 */
export async function retryWithBackoff(fn, options = {}) {
    const {
        maxRetries = 3,
        baseDelay = 1000,
        onRetry
    } = options;

    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on last attempt
            if (attempt === maxRetries) {
                break;
            }

            // Calculate exponential backoff delay: 1s, 2s, 4s
            const delay = baseDelay * Math.pow(2, attempt);

            // Notify about retry
            if (onRetry) {
                onRetry(attempt + 1, delay);
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // All retries failed
    throw lastError;
}
