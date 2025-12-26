import { useState } from 'react';
import PaymentApi from '../services/paymentApi';

const useImePayPayment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Start IME Pay payment process
     * @param {Object} paymentData - { amount, refId, customerMsisdn }
     */
    const startPayment = async (paymentData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await PaymentApi.initiateImePay(paymentData);

            if (response && response.imepay_redirect_url) {
                window.location.href = response.imepay_redirect_url;
            } else if (response && response.redirectUrl) {
                window.location.href = response.redirectUrl;
            } else {
                throw new Error('Invalid response from IME Pay initiation');
            }
        } catch (err) {
            setError(err.message || 'Payment initiation failed');
        } finally {
            setLoading(false);
        }
    };

    return { startPayment, loading, error };
};

export default useImePayPayment;
