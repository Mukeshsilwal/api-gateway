import apiClient, { API_ENDPOINTS } from '../config/apiConfig';

/**
 * Payment API Service
 * Handles all payment processing related API calls
 */
class PaymentService {
    /**
     * Initiate payment
     * @param {Object} paymentData - { bookingId, amount, currency, provider }
     * @returns {Promise} Response with payment initiation data
     */
    async initiatePayment(paymentData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.INITIATE, paymentData);
            return response.data;
        } catch (error) {
            console.error('Initiate payment error:', error);
            throw error;
        }
    }

    /**
     * Verify payment
     * @param {Object} verificationData - Payment verification data
     * @returns {Promise} Response with verification result
     */
    async verifyPayment(verificationData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.VERIFY, verificationData);
            return response.data;
        } catch (error) {
            console.error('Verify payment error:', error);
            throw error;
        }
    }

    /**
     * Get payment status
     * @param {string} paymentId - Payment ID
     * @returns {Promise} Response with payment status
     */
    async getPaymentStatus(paymentId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.STATUS(paymentId));
            return response.data;
        } catch (error) {
            console.error('Get payment status error:', error);
            throw error;
        }
    }

    /**
     * Handle payment callback
     * @param {Object} callbackData - Callback data from payment gateway
     * @returns {Promise} Response with callback processing result
     */
    async handleCallback(callbackData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.CALLBACK, callbackData);
            return response.data;
        } catch (error) {
            console.error('Handle payment callback error:', error);
            throw error;
        }
    }

    // eSewa specific methods
    async initiateEsewaPayment(paymentData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.ESEWA.INITIATE, paymentData);
            return response.data;
        } catch (error) {
            console.error('Initiate eSewa payment error:', error);
            throw error;
        }
    }

    async verifyEsewaPayment(verificationData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.ESEWA.VERIFY, verificationData);
            return response.data;
        } catch (error) {
            console.error('Verify eSewa payment error:', error);
            throw error;
        }
    }

    // Khalti specific methods
    async initiateKhaltiPayment(paymentData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.KHALTI.INITIATE, paymentData);
            return response.data;
        } catch (error) {
            console.error('Initiate Khalti payment error:', error);
            throw error;
        }
    }

    async verifyKhaltiPayment(verificationData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.KHALTI.VERIFY, verificationData);
            return response.data;
        } catch (error) {
            console.error('Verify Khalti payment error:', error);
            throw error;
        }
    }

    // IME Pay specific methods
    async initiateImePayPayment(paymentData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.IMEPAY.INITIATE, paymentData);
            return response.data;
        } catch (error) {
            console.error('Initiate IME Pay payment error:', error);
            throw error;
        }
    }

    async verifyImePayPayment(verificationData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.IMEPAY.VERIFY, verificationData);
            return response.data;
        } catch (error) {
            console.error('Verify IME Pay payment error:', error);
            throw error;
        }
    }
}

export default new PaymentService();
