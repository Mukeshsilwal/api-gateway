import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingApi from '../services/bookingApi';
import bookingService from '../services/bookingService';
import apiService from '../services/api.service';
import paymentService from '../services/paymentService';
import API_CONFIG from '../config/api';
import { setBookingContext, getBookingContext, clearBookingContext } from '../utils/paymentStorage';
import Logger from '../utils/logger';

/**
 * Payment flow states
 */
export const PAYMENT_STATES = {
    IDLE: 'idle',
    INITIATING: 'initiating',
    REDIRECTING: 'redirecting',
    VERIFYING: 'verifying',
    COMPLETING: 'completing',
    POLLING: 'polling',
    CONFIRMED: 'confirmed',
    FAILED: 'failed'
};

/**
 * Main hook for orchestrating eSewa payment flow
 * Handles: complete booking → get htmlForm → redirect
 */
export default function useEsewaPayment() {
    const navigate = useNavigate();
    const [state, setState] = useState(PAYMENT_STATES.IDLE);
    const [error, setError] = useState(null);
    const [bookingId, setBookingId] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [pollingAttempt, setPollingAttempt] = useState(0);

    /**
     * Step 1: Complete booking and get htmlForm from backend
     */
    const initiatePayment = useCallback(async (bookingData) => {
        // Clear any existing session to start fresh
        clearBookingContext();

        setState(PAYMENT_STATES.INITIATING);
        setError(null);

        try {
            // Call the complete booking endpoint with full booking data
            Logger.info('Completing booking...', { type: bookingData.type });

            // Call the complete booking endpoint with full booking data
            Logger.info('Completing booking...', { type: bookingData.type });

            const response = await bookingService.completeHotelBooking(bookingData);

            const completeResponse = response.data || response;

            // The response structure is: { bookingData: {...}, paymentData: {...} }
            const bookingInfo = completeResponse.bookingData;
            const paymentInfo = completeResponse.paymentData;

            if (!bookingInfo || !paymentInfo) {
                console.error('Invalid response structure:', completeResponse);
                throw new Error('Invalid response from booking service - missing bookingData or paymentData');
            }

            const extractedBookingId = bookingInfo.bookingId;
            const amount = bookingInfo.totalAmount || completeResponse.totalAmount;

            // Extract htmlForm from paymentData.data.htmlForm
            const htmlForm = paymentInfo.data?.htmlForm;
            const transactionId = paymentInfo.data?.transactionId || paymentInfo.transactionId;

            if (!extractedBookingId || !amount) {
                console.error('Missing required fields:', { extractedBookingId, amount, bookingInfo });
                throw new Error('Invalid response from booking service - missing bookingId or amount');
            }

            if (!htmlForm) {
                console.error('Missing htmlForm in payment response:', paymentInfo);
                throw new Error('No HTML form received from payment gateway');
            }

            console.log('✅ Booking completed:', { bookingId: extractedBookingId, amount, transactionId });
            console.log('📝 htmlForm received:', htmlForm ? 'YES' : 'NO', htmlForm?.substring(0, 100));
            setBookingId(extractedBookingId);

            // Store in sessionStorage for recovery
            const contextToStore = {
                bookingId: extractedBookingId,
                amount,
                htmlForm,
                transactionId,
                bookingData
            };

            console.log('💾 Storing in sessionStorage:', {
                bookingId: contextToStore.bookingId,
                amount: contextToStore.amount,
                transactionId: contextToStore.transactionId,
                hasHtmlForm: !!contextToStore.htmlForm,
                htmlFormLength: contextToStore.htmlForm?.length
            });

            setBookingContext(contextToStore);

            console.log('✅ Stored in sessionStorage, navigating to /payment/redirect');
            Logger.info('Payment initiated, redirecting to eSewa...', { bookingId: extractedBookingId, transactionId });

            // Navigate to redirect page
            setState(PAYMENT_STATES.REDIRECTING);
            navigate('/payment/redirect');

        } catch (err) {
            console.error('❌ Payment initiation failed:', err);
            Logger.error('Payment initiation failed:', err);
            setError(err.message || 'Failed to initiate payment');
            setState(PAYMENT_STATES.FAILED);
        }
    }, [navigate]);

    /**
     * Step 3-5: Verify payment and complete booking
     * Called from PaymentSuccess page
     */
    /**
     * Step 3-5: Verify payment and complete booking
     * Called from PaymentSuccess page
     */
    const verifyAndComplete = useCallback(async (verificationParams) => {
        // verificationParams should be { transactionId, providerToken }

        // Retrieve booking context
        const context = getBookingContext();

        // If context exists, use it. If not (session expired/cleared), try to proceed with params
        let currentBookingId = context?.bookingId || bookingId;

        if (!currentBookingId) {
            // We might have bookingId in verificationParams if passed
            // But usually we need context. 
            // If it's pure API verification, maybe we don't strictly need bookingId for the first call?
            // The verify endpoint returns "PaymentVerificationWithBooking" which contains booking info.
        }

        try {
            // Step 3: Verify payment
            setState(PAYMENT_STATES.VERIFYING);

            Logger.info('Verifying payment with backend...', verificationParams);

            // Call the NEW verify endpoint
            // Endpoint: POST /api/bff/v1/payments/verify/esewa
            const verifyResponse = await paymentService.verifyPayment('esewa', {
                transactionId: verificationParams.transactionId,
                providerToken: verificationParams.providerToken
            });

            Logger.info('Payment verified successfully:', verifyResponse);

            // Extract bookingId from response if available, or stay with context
            // Response structure: { success: true, message: "...", data: { booking: {...} } }
            // Adjust based on actual response structure shown in Java code:
            // return ResponseEntity.ok(new Response<>(200, "Payment verified", response))

            const responseData = verifyResponse.data || verifyResponse;

            Logger.info('Booking completed via verification:', responseData);
            setState(PAYMENT_STATES.CONFIRMED);
            clearBookingContext();

            return responseData;

        } catch (err) {
            Logger.error('Verify failed:', err);
            setError(err.message || 'Failed to verify payment');
            setState(PAYMENT_STATES.FAILED);
            throw err;
        }
    }, [bookingId]);

    /**
     * Resume flow from sessionStorage (for page refresh)
     */
    useEffect(() => {
        const context = getBookingContext();
        if (context && state === PAYMENT_STATES.IDLE) {
            setBookingId(context.bookingId);
            Logger.info('Resuming payment flow from sessionStorage', { bookingId: context.bookingId });
        }
    }, [state]);

    return {
        state,
        error,
        bookingId,
        retryCount,
        pollingAttempt,
        initiatePayment,
        verifyAndComplete
    };
}
