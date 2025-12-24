import apiService from './api.service';
import API_CONFIG from '../config/api';

/**
 * Service for handling unified booking payments
 * Wraps unified bookings with payment initiation
 */
const unifiedBookingPaymentService = {
    /**
     * Complete unified booking with payment
     * Similar to completeHotelBooking but for unified bookings
     * 
     * @param {Object} payload - { customerId, bookings: [...], totalAmount }
     * @returns {Promise<Object>} - { bookingData, paymentData }
     */
    completeUnifiedBooking: async (payload) => {
        try {
            // Step 1: Create the unified booking
            const bookingResponse = await apiService.post('/api/booking/unified', {
                customerId: payload.customerId,
                bookings: payload.bookings
            });

            const bookingData = bookingResponse.data?.data || bookingResponse.data;

            // Step 2: Initiate payment for the total amount
            const paymentPayload = {
                amount: bookingData.totalAmount,
                productId: bookingData.transactionId,
                productName: `Unified Booking - ${bookingData.bookings.length} services`,
                gateway: 'ESEWA'
            };

            const paymentResponse = await apiService.post(
                API_CONFIG.ENDPOINTS.PAYMENT_INITIATE,
                paymentPayload
            );

            const paymentData = paymentResponse.data?.data || paymentResponse.data;

            // Return combined response similar to hotel booking
            return {
                data: {
                    bookingData: {
                        bookingId: bookingData.transactionId,
                        totalAmount: bookingData.totalAmount,
                        status: bookingData.status,
                        bookings: bookingData.bookings
                    },
                    paymentData: {
                        transactionId: paymentData.transactionId,
                        data: {
                            htmlForm: paymentData.htmlForm,
                            transactionId: paymentData.transactionId
                        }
                    }
                }
            };
        } catch (error) {
            console.error('Error completing unified booking with payment:', error);
            throw error;
        }
    },

    /**
     * Verify unified booking payment
     * Called after eSewa redirect
     * 
     * @param {Object} verificationParams - { transactionId, providerToken }
     * @returns {Promise<Object>}
     */
    verifyUnifiedBookingPayment: async (verificationParams) => {
        try {
            // Use existing payment verification endpoint
            const response = await apiService.post(
                '/api/bff/v1/payments/verify/esewa',
                {
                    transactionId: verificationParams.transactionId,
                    providerToken: verificationParams.providerToken
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error verifying unified booking payment:', error);
            throw error;
        }
    }
};

export default unifiedBookingPaymentService;
