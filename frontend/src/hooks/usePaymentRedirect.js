import { useState, useCallback } from 'react';
import { redirectToPaymentGateway } from '../utils/paymentUtils';
import toast from "react-hot-toast";

/**
 * Custom hook to handle payment redirection with loading state
 * @returns {Object} { initiatePaymentRedirect, isRedirecting, error }
 */
export const usePaymentRedirect = () => {
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Handles the payment initiation response and redirects the user
     * @param {Object} apiResponse - The full API response from payment initiation endpoint
     */
    const initiatePaymentRedirect = useCallback(async (apiResponse) => {
        setIsRedirecting(true);
        setError(null);

        try {
            // Validate response structure
            if (!apiResponse || !apiResponse.success || !apiResponse.data) {
                throw new Error("Invalid API response format");
            }

            // Extract the actual payment data (nested data.data based on user example)
            // Support both direct data object or nested data.data structure
            const paymentData = apiResponse.data.data || apiResponse.data;

            if (!paymentData || !paymentData.gatewayUrl || !paymentData.params) {
                console.error("Missing payment details:", paymentData);
                throw new Error("Payment initialization failed: Missing gateway details");
            }

            // Optional: Add a small delay to show loading state (better UX)
            await new Promise(resolve => setTimeout(resolve, 800));

            // Perform the redirect
            redirectToPaymentGateway(paymentData);

        } catch (err) {
            console.error("Payment redirect error:", err);
            setError(err.message);
            setIsRedirecting(false);
            toast.error(err.message || "Failed to redirect to payment gateway");
        }
    }, []);

    return {
        initiatePaymentRedirect,
        isRedirecting,
        error
    };
};
