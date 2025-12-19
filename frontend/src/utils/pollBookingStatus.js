import bookingApi from '../services/bookingApi';
import Logger from './logger';

/**
 * Poll booking status until it reaches a terminal state
 * @param {string} bookingId - Booking ID to poll
 * @param {object} options - Polling options
 * @param {number} options.interval - Polling interval in ms (default: 3000)
 * @param {number} options.maxAttempts - Maximum polling attempts (default: 10)
 * @param {Function} options.onUpdate - Callback on each poll (status, attempt)
 * @returns {Promise<string>} - Final status: CONFIRMED or FAILED
 */
export async function pollBookingStatus(bookingId, options = {}) {
    const {
        interval = 3000,
        maxAttempts = 10,
        onUpdate
    } = options;

    Logger.info('Starting booking status polling', { bookingId, interval, maxAttempts });

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const status = await bookingApi.getBookingStatus(bookingId);

            Logger.info(`Polling attempt ${attempt}/${maxAttempts}`, { status });

            // Notify about status update
            if (onUpdate) {
                onUpdate(status, attempt);
            }

            // Check if we've reached a terminal state
            if (status === 'CONFIRMED' || status === 'FAILED') {
                Logger.info('Polling completed', { status, attempts: attempt });
                return status;
            }

            // Wait before next poll (unless it's the last attempt)
            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        } catch (error) {
            Logger.error(`Polling attempt ${attempt} failed:`, error);

            // Continue polling even if one attempt fails
            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        }
    }

    // Polling timed out
    Logger.error('Polling timeout - max attempts reached');
    throw new Error('Booking status polling timeout. Please contact support.');
}
