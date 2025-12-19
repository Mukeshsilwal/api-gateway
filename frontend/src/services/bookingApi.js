import apiService from './api.service';
import API_CONFIG from '../config/api';
import { retryWithBackoff } from '../utils/retryWithBackoff';
import Logger from '../utils/logger';

/**
 * Centralized Booking API Service
 * Handles all booking-related API calls with retry logic and error handling
 */
const bookingApi = {
    /**
     * Step 1: Initiate booking (creates PENDING booking)
     * @param {object} bookingData - Booking details
     * @returns {Promise<object>} - { bookingId, amount, productCode, transactionUuid }
     */
    async initiateBooking(bookingData) {
        try {
            Logger.info('Initiating booking...', { type: bookingData.type });
            const response = await apiService.post(
                API_CONFIG.ENDPOINTS.BOOKING_INITIATE,
                bookingData
            );

            const data = response.data || response;
            Logger.info('Booking initiated successfully', { bookingId: data.bookingId });

            return data;
        } catch (error) {
            Logger.error('Failed to initiate booking:', error);
            throw new Error(error.message || 'Failed to create booking');
        }
    },

    /**
     * Step 3: Verify payment with eSewa
     * @param {object} verificationData - { bookingId, transactionUuid, refId, provider }
     * @returns {Promise<object>} - { status, verified }
     */
    async verifyPayment(verificationData) {
        try {
            Logger.info('Verifying payment...', { bookingId: verificationData.bookingId });
            const response = await apiService.post(
                API_CONFIG.ENDPOINTS.PAYMENT_VERIFY,
                verificationData
            );

            const data = response.data || response;

            if (data.status !== 'SUCCESS' || !data.verified) {
                throw new Error('Payment verification failed');
            }

            Logger.info('Payment verified successfully');
            return data;
        } catch (error) {
            Logger.error('Payment verification error:', error);
            throw new Error(error.message || 'Failed to verify payment');
        }
    },

    /**
     * Step 4: Complete booking (with automatic retry logic)
     * @param {string} bookingId - Booking ID
     * @param {object} options - { maxRetries, onRetry }
     * @returns {Promise<object>} - { status, bookingId, confirmationCode }
     */
    async completeBooking(bookingId, options = {}) {
        const { maxRetries = 3, onRetry } = options;

        Logger.info('Completing booking...', { bookingId, maxRetries });

        try {
            return await retryWithBackoff(
                async () => {
                    const response = await apiService.post(
                        API_CONFIG.ENDPOINTS.BOOKING_COMPLETE,
                        { bookingId }
                    );

                    const data = response.data || response;

                    if (data.status !== 'CONFIRMED') {
                        throw new Error('Booking completion failed');
                    }

                    Logger.info('Booking completed successfully', {
                        bookingId: data.bookingId,
                        confirmationCode: data.confirmationCode
                    });

                    return data;
                },
                {
                    maxRetries,
                    baseDelay: 1000, // 1s, 2s, 4s
                    onRetry: (attempt, delay) => {
                        Logger.warn(`Retrying booking completion (${attempt}/${maxRetries})`, { delay });
                        onRetry?.(attempt, delay);
                    }
                }
            );
        } catch (error) {
            Logger.error('Booking completion failed after retries:', error);
            throw error;
        }
    },

    /**
     * Step 4.5: Initiate payment after booking completion
     * Sends PaymentRequest DTO to backend to get eSewa HTML form
     * @param {string} bookingId - Booking ID
     * @param {number} amount - Payment amount
     * @param {string} provider - Payment provider (default: ESEWA)
     * @returns {Promise<object>} - { htmlForm, transactionId }
     */
    async initiatePaymentAfterComplete(bookingId, amount, provider = 'ESEWA') {
        try {
            Logger.info('Initiating payment after booking completion...', { bookingId, amount, provider });

            const response = await apiService.post(
                `${API_CONFIG.ENDPOINTS.PAYMENT_INITIATE}/${provider.toLowerCase()}`,
                {
                    provider: provider,
                    amount: amount,
                    metadata: {
                        bookingId: bookingId
                    }
                }
            );

            const data = response.data || response;

            // Extract htmlForm from nested response structure
            // Response: { data: { paymentResponse: { data: { htmlForm, transactionId } } } }
            const htmlForm = data.data?.paymentResponse?.data?.htmlForm;
            const transactionId = data.data?.paymentResponse?.data?.transactionId;

            if (!htmlForm) {
                Logger.error('Response structure:', data);
                throw new Error('No HTML form received from payment gateway');
            }

            Logger.info('Payment initiation successful', { bookingId, transactionId });

            return {
                htmlForm,
                transactionId
            };
        } catch (error) {
            Logger.error('Payment initiation failed:', error);
            throw new Error(error.message || 'Failed to initiate payment');
        }
    },

    /**
     * Step 5: Get booking status (for polling)
     * @param {string} bookingId - Booking ID
     * @returns {Promise<string>} - Status: PENDING, CONFIRMED, FAILED
     */
    async getBookingStatus(bookingId) {
        try {
            const response = await apiService.get(
                `${API_CONFIG.ENDPOINTS.BOOKING_STATUS}${bookingId}/status`
            );

            const data = response.data || response;
            return data.status;
        } catch (error) {
            Logger.error('Failed to get booking status:', error);
            throw error;
        }
    }
};

export default bookingApi;
