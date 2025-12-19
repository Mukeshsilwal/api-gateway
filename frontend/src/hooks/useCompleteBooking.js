import { useState } from 'react';
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';
import { redirectToGateway } from '../utils/redirectToGateway';
import Logger from '../utils/logger';

/**
 * Custom hook for completing bookings with payment integration.
 * Orchestrates the complete flow: aggregator API -> payment initiation -> gateway redirect.
 * 
 * @returns {object} - { completeBooking, isLoading, error }
 */
export default function useCompleteBooking() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Complete booking and initiate payment.
     * 
     * @param {object} bookingPayload - Complete booking request payload
     * @param {string} provider - Payment provider (e.g., 'esewa', 'khalti')
     */
    const completeBooking = async (bookingPayload, provider = 'esewa') => {
        setIsLoading(true);
        setError(null);

        try {
            // STEP 1: Call Aggregator API to create booking
            Logger.info('Calling aggregator API to complete booking...');
            const aggregatorResponse = await bookingService.completeHotelBooking(bookingPayload);

            // Extract booking and payment data
            const { bookingData, paymentData } = aggregatorResponse;

            if (!bookingData || !paymentData) {
                throw new Error('Invalid response from booking service');
            }

            const { bookingId } = bookingData;
            const { amount, provider: paymentProvider } = paymentData;

            Logger.info('Booking created:', { bookingId, amount, provider: paymentProvider });

            // STEP 2: Initiate Payment with backend
            Logger.info('Initiating payment with provider:', paymentProvider || provider);

            let paymentResponse;
            if (paymentProvider === 'esewa' || provider === 'esewa') {
                paymentResponse = await paymentService.initiateEsewaPayment(amount, {
                    bookingId
                });
            } else {
                // For other providers, use generic initiate
                paymentResponse = await paymentService.initiatePayment(
                    paymentProvider || provider,
                    { amount, metadata: { bookingId } }
                );
            }

            if (!paymentResponse || paymentResponse.status !== 'SUCCESS') {
                throw new Error('Payment initiation failed');
            }

            const { data: paymentInitData } = paymentResponse;
            const { gatewayUrl, method, params } = paymentInitData;

            Logger.info('Payment initiated successfully:', { gatewayUrl, method });

            // STEP 3: Redirect to Payment Gateway
            if (method === 'POST' && gatewayUrl && params) {
                Logger.info('Redirecting to payment gateway...');
                redirectToGateway(gatewayUrl, params);
            } else if (gatewayUrl) {
                // Fallback to GET redirect
                window.location.href = gatewayUrl;
            } else {
                throw new Error('No gateway URL provided by backend');
            }

        } catch (err) {
            Logger.error('Booking completion error:', err);
            setError(err.message || 'Failed to complete booking');
            setIsLoading(false);
            throw err;
        }
    };

    return {
        completeBooking,
        isLoading,
        error
    };
}
