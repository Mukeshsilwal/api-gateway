import axios from 'axios';
import API_CONFIG from '../config/api';

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const PaymentApi = {
    /**
     * Initiate eSewa Payment
     * @param {Object} data - Payment details
     * @returns {Promise<Object>} Signed form parameters
     */
    initiateEsewa: async (data) => {
        try {
            const response = await api.post(`${API_CONFIG.ENDPOINTS.PAYMENT_INITIATE}/esewa`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Decode eSewa encoded signature (Verification)
     * @param {string} encodedSignature - Base64 encoded signature from eSewa redirect
     * @returns {Promise<Object>} Decoded payment details
     */
    decodeEsewaSignature: async (encodedSignature) => {
        try {
            const response = await api.post(`${API_CONFIG.ENDPOINTS.PAYMENT_VERIFY}/esewa`, {
                data: encodedSignature
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Initiate Khalti Payment
     * @param {Object} data - { amount, purchaseOrderId, purchaseOrderName, customerInfo }
     * @returns {Promise<Object>} { payment_url, pidx, ... }
     */
    initiateKhaltiPayment: async (data) => {
        try {
            const response = await api.post(`${API_CONFIG.ENDPOINTS.PAYMENT_INITIATE}/khalti`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Verify Khalti Payment
     * @param {Object} data - { pidx, amount }
     * @returns {Promise<Object>} Verification status
     */
    verifyKhaltiPayment: async (data) => {
        try {
            const response = await api.post(`${API_CONFIG.ENDPOINTS.PAYMENT_VERIFY}/khalti`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Initiate IME Pay Payment
     * @param {Object} data - { amount, refId, customerMsisdn }
     * @returns {Promise<Object>} { imepay_redirect_url, ... }
     */
    initiateImePay: async (data) => {
        try {
            const response = await api.post(`${API_CONFIG.ENDPOINTS.PAYMENT_INITIATE}/imepay`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Verify IME Pay Payment
     * @param {Object} data - Verification parameters
     * @returns {Promise<Object>} Verification status
     */
    verifyImePay: async (data) => {
        try {
            const response = await api.post(`${API_CONFIG.ENDPOINTS.PAYMENT_VERIFY}/imepay`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default PaymentApi;
