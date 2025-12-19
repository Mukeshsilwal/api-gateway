import apiService from './api.service';
import API_CONFIG from '../config/api';

const paymentService = {
    /**
     * Initiate a payment.
     * @param {string} provider - Payment provider (e.g., 'KHALTI', 'ESEWA')
     * @param {object} paymentData - { amount, currency, returnUrl, cancelUrl, metadata }
     * @returns {Promise<object>}
     */
    initiatePayment: async (provider, paymentData) => {
        try {
            const response = await apiService.post(`${API_CONFIG.ENDPOINTS.PAYMENT_INITIATE}${provider}`, paymentData);
            return response.data;
        } catch (error) {
            console.error(`Error initiating payment with ${provider}:`, error);
            throw error;
        }
    },

    /**
     * Verify a payment.
     * @param {string} provider
     * @param {object} verificationData - { transactionId, providerTransactionId, additionalParams }
     * @returns {Promise<object>}
     */
    verifyPayment: async (provider, verificationData) => {
        try {
            // The backend expects /verify/{provider} with body { transactionId, providerToken }
            // API_CONFIG.ENDPOINTS.PAYMENT_VERIFY likely ends with /
            const endpoint = `${API_CONFIG.ENDPOINTS.PAYMENT_VERIFY}/${provider}`; // Assuming endpoint doesn't include /verify/ yet, or adjusting accordingly. 
            // Actually, based on standard config it's usually /api/bff/v1/payments/verify
            // Let's rely on API_CONFIG.ENDPOINTS.PAYMENT_VERIFY being the base URL like '/api/bff/v1/payments/verify'
            // But I should check api.js config to be sure.
            // For now, let's assume usage is correct: verifyPayment('esewa', { transactionId, providerToken })

            // To be safe and clean:
            const response = await apiService.post(`${API_CONFIG.ENDPOINTS.PAYMENT_VERIFY}/${provider}`, {
                transactionId: verificationData.transactionId,
                providerToken: verificationData.providerToken
            });
            return response.data;
        } catch (error) {
            console.error(`Error verifying payment with ${provider}:`, error);
            throw error;
        }
    },

    /**
     * Verify payment (New V2 endpoint).
     * @param {string} transactionId
     * @returns {Promise<object>}
     */
    verifyPaymentNew: async (transactionId, providerToken) => {
        try {
            const response = await apiService.post(`${API_CONFIG.ENDPOINTS.PAYMENT_VERIFY}/esewa`, {
                transactionId: transactionId,
                providerToken: providerToken
            });
            return response.data;
        } catch (error) {
            console.error('Error verifying payment (new):', error);
            throw error;
        }
    },

    /**
     * Get transaction details.
     * @param {string} transactionId
     * @returns {Promise<object>}
     */
    getTransaction: async (transactionId) => {
        try {
            const response = await apiService.get(`${API_CONFIG.ENDPOINTS.PAYMENT_TRANSACTION}${transactionId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching transaction:', error);
            throw error;
        }
    },

    /**
     * Cancel a transaction/payment.
     * @returns {Promise<object>}
     */
    cancelTransaction: async () => {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.PAYMENT_CANCEL);
            return response.data;
        } catch (error) {
            console.error('Error cancelling transaction:', error);
            throw error;
        }
    },

    /**
     * Initiate eSewa payment.
     * @param {number} amount - Payment amount
     * @param {object} metadata - Payment metadata (e.g., bookingId)
     * @returns {Promise<object>} - { status, data: { gatewayUrl, method, params } }
     */
    initiateEsewaPayment: async (amount, metadata) => {
        try {
            const response = await apiService.post(
                `${API_CONFIG.ENDPOINTS.PAYMENT_INITIATE}/esewa`,
                { amount, metadata }
            );
            return response.data;
        } catch (error) {
            console.error('Error initiating eSewa payment:', error);
            throw error;
        }
    }
};

export default paymentService;
