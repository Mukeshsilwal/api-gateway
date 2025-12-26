import { useState } from 'react';
import PaymentApi from '../services/paymentApi';

const useKhaltiPayment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Start Khalti payment process
     * @param {Object} paymentData - { amount, purchaseOrderId, purchaseOrderName, customerInfo }
     */
    const startPayment = async (paymentData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await PaymentApi.initiateKhaltiPayment(paymentData);

            if (response && response.payment_url) {
                window.location.href = response.payment_url;
            } else if (response && response.redirectUrl) {
                window.location.href = response.redirectUrl;
            } else {
                throw new Error('Invalid response from Khalti initiation');
            }
        } catch (err) {
            setError(err.message || 'Payment initiation failed');
        } finally {
            setLoading(false);
        }
    };

    return { startPayment, loading, error };
};

export default useKhaltiPayment;
