import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingApi from '../services/bookingApi';
import bookingService from '../services/bookingService';
import apiService from '../services/api.service';
import paymentService from '../services/paymentService';
import API_CONFIG from '../config/api';
import { setBookingContext, getBookingContext, clearBookingContext } from '../utils/paymentStorage';
import { submitEsewaForm, submitHtmlForm } from '../utils/paymentUtils';
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

            // Flexible Extraction Logic to handle both Booking and Payment endpoints
            let bookingInfo, paymentInfo;

            if (completeResponse.bookingData && completeResponse.paymentData) {
                // Case 1: CompleteBookingResponse (from /bookings/complete)
                bookingInfo = completeResponse.bookingData;
                paymentInfo = completeResponse.paymentData;
            } else if (completeResponse.paymentResponse) {
                // Case 2: PaymentInitiationResponse (from /payments/initiate)
                bookingInfo = {
                    bookingId: completeResponse.bookingId,
                    totalAmount: completeResponse.paymentResponse.amount || 0
                };
                paymentInfo = completeResponse.paymentResponse;
            } else {
                // Case 3: Flat or unknown structure - try direct access
                bookingInfo = {
                    bookingId: completeResponse.bookingId || 'UNKNOWN',
                    totalAmount: completeResponse.amount || 0
                };
                paymentInfo = completeResponse;
            }

            if (!bookingInfo || !paymentInfo) {
                console.error('Invalid response structure:', completeResponse);
                throw new Error('Invalid response from service - missing booking or payment info');
            }

            const extractedBookingId = bookingInfo.bookingId || completeResponse.bookingId;
            const amount = bookingInfo.totalAmount || completeResponse.totalAmount || paymentInfo.amount;

            // Robust htmlForm extraction
            const innerData = paymentInfo.data || paymentInfo;
            const htmlForm = innerData.htmlForm || paymentInfo.htmlForm;
            const transactionId = innerData.transactionId || paymentInfo.transactionId || paymentInfo.providerTxnId;

            if (!extractedBookingId || !amount) {
                // Allow fallback if bookingId is missing but we have payment info (e.g. direct payment)
                if (!transactionId) {
                    console.error('Missing required fields:', { extractedBookingId, amount, bookingInfo });
                    throw new Error('Invalid response - missing bookingId/amount/transactionId');
                }
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

            setBookingContext(contextToStore);

            console.log('✅ Stored in sessionStorage');
            Logger.info('Payment initiated, performing direct submit to eSewa...', { bookingId: extractedBookingId, transactionId });

            // Direct Submission (Bypassing /payment/redirect page for reliability)
            setState(PAYMENT_STATES.REDIRECTING);

            // Give UI a moment to show "Redirecting" state
            setTimeout(() => {
                try {
                    submitHtmlForm(htmlForm);
                } catch (e) {
                    console.error("Direct submit failed, falling back to redirect page", e);
                    navigate('/payment/redirect');
                }
            }, 500);

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
