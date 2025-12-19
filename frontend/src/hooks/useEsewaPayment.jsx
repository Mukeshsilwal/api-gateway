import { useState } from 'react';
import PaymentApi from '../services/paymentApi';
import { submitEsewaForm } from '../utils/paymentUtils';

const useEsewaPayment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Start eSewa payment process
     * @param {Object} paymentData - { amount, productId, productDetails }
     */
    const startPayment = async (paymentData) => {
        setLoading(true);
        setError(null);

        try {
            // Initiate payment to get signed parameters
            const response = await PaymentApi.initiateEsewa(paymentData);

            // Auto-submit the form with the received parameters
            submitEsewaForm(response);

        } catch (err) {
            setError(err.message || 'Payment initiation failed');
        } finally {
            setLoading(false);
        }
    };

    return { startPayment, loading, error };
};

export default useEsewaPayment;
