import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import paymentService from '../services/payment.service';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/ui/LoadingSpinner';

/**
 * PaymentCallback Component
 * Handles redirect from Khalti payment gateway
 * Verifies payment and confirms booking
 */
const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState('processing'); // processing, success, error
    const [message, setMessage] = useState('Verifying your payment...');
    const [bookingData, setBookingData] = useState(null);

    useEffect(() => {
        handlePaymentCallback();
    }, []);

    const handlePaymentCallback = async () => {
        try {
            // Check for eSewa params (V1/Legacy)
            const oid = searchParams.get('oid');
            const refId = searchParams.get('refId');

            if (oid && refId) {
                // Handle eSewa Verification
                setMessage('Verifying payment with eSewa...');

                // Call backend verification API (Public Endpoint)
                // Strict rules: No auth headers, backend is source of truth
                const response = await fetch('/api/bff/v1/payments/verify/esewa', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        transactionId: oid,
                        providerToken: refId
                    })
                });

                if (!response.ok) {
                    throw new Error(`Verification failed with status ${response.status}`);
                }

                const result = await response.json();

                // Check for backend success structure
                // Expected: { statusCode: 200, data: { verificationResponse: { verified: true }, bookingUpdated: true } }
                const isVerified = result.data?.verificationResponse?.verified === true || result.data?.verificationResponse?.status === 'SUCCESS';
                const isBookingUpdated = result.data?.bookingUpdated === true;

                if (isVerified && isBookingUpdated) {
                    setStatus('success');
                    setMessage('Payment verified and booking confirmed!');
                    setBookingData(result.data.verificationResponse);
                    toast.success('Payment verified successfully!');

                    // Redirect to success page or show details
                    setTimeout(() => {
                        navigate('/payment/success', {
                            state: { bookingData: result.data }
                        });
                    }, 2000);
                    return;
                } else {
                    throw new Error('Payment verification returned failure status');
                }
            }

            // --- Existing Khalti Logic Below ---

            // Extract payment parameters from URL
            const callbackParams = {
                pidx: searchParams.get('pidx'),
                transaction_id: searchParams.get('transaction_id'),
                tidx: searchParams.get('tidx'),
                amount: searchParams.get('amount'),
                mobile: searchParams.get('mobile'),
                purchase_order_id: searchParams.get('purchase_order_id'),
                purchase_order_name: searchParams.get('purchase_order_name'),
                status: searchParams.get('status')
            };

            // Check if payment was cancelled
            if (callbackParams.status === 'Canceled' || callbackParams.status === 'User canceled') {
                setStatus('error');
                setMessage('Payment was cancelled. Your booking has not been confirmed.');
                toast.error('Payment cancelled');
                return;
            }

            // Only proceed with Khalti if Khalti params exist
            if (!callbackParams.pidx) {
                // If neither eSewa nor Khalti params found
                setStatus('error');
                setMessage('Invalid callback parameters.');
                return;
            }

            // Get pending payment context
            const pendingPayment = paymentService.getPendingPayment();

            if (!pendingPayment) {
                setStatus('error');
                setMessage('Payment session expired. Please try booking again.');
                toast.error('Session expired');
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            setMessage('Verifying payment with Khalti...');

            // Step 1: Verify payment with backend
            const verificationResult = await paymentService.verifyKhaltiPayment(callbackParams);

            if (!verificationResult.success || !verificationResult.verified) {
                setStatus('error');
                setMessage(verificationResult.error || 'Payment verification failed. Please contact support.');
                toast.error('Payment verification failed');
                return;
            }

            setMessage('Payment verified! Creating your booking...');

            // Step 2: Confirm booking after successful verification
            const confirmationResult = await paymentService.confirmBooking(
                pendingPayment.tempBookingId,
                verificationResult
            );

            if (confirmationResult.success) {
                setStatus('success');
                setMessage('Booking confirmed successfully!');
                setBookingData(confirmationResult.bookingData);
                toast.success('Booking confirmed!');

                // Store booking data for confirmation page
                localStorage.setItem('bookingRes', JSON.stringify(confirmationResult.bookingData));

                // Redirect based on booking type
                const bookingType = pendingPayment.bookingType;
                setTimeout(() => {
                    if (bookingType === 'BUS') {
                        navigate('/ticket-confirm');
                    } else if (bookingType === 'HOTEL') {
                        navigate('/hotel-booking-confirmation', {
                            state: { bookingData: confirmationResult.bookingData }
                        });
                    } else {
                        navigate('/payment/success', {
                            state: { bookingData: confirmationResult.bookingData }
                        });
                    }
                }, 2000);
            } else {
                throw new Error(confirmationResult.message || 'Booking confirmation failed');
            }

        } catch (error) {
            console.error('Payment callback error:', error);
            setStatus('error');
            setMessage(error.message || 'An error occurred while processing your payment. Please contact support.');
            toast.error(error.message || 'Payment processing failed');
        }
    };

    const handleRetry = () => {
        paymentService.clearPendingPayment();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <NavigationBar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                        {/* Processing State */}
                        {status === 'processing' && (
                            <div className="text-center">
                                <div className="mb-6">
                                    <LoadingSpinner size="large" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                                    Processing Payment
                                </h2>
                                <p className="text-slate-600 mb-6">{message}</p>
                                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Please wait, do not close this window...</span>
                                </div>
                            </div>
                        )}

                        {/* Success State */}
                        {status === 'success' && (
                            <div className="text-center">
                                <div className="mb-6 flex justify-center">
                                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-green-600 mb-4">
                                    Payment Successful!
                                </h2>
                                <p className="text-slate-600 mb-6">{message}</p>
                                <p className="text-sm text-slate-500">Redirecting to confirmation page...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {status === 'error' && (
                            <div className="text-center">
                                <div className="mb-6 flex justify-center">
                                    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-red-600 mb-4">
                                    Payment Failed
                                </h2>
                                <p className="text-slate-600 mb-8">{message}</p>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={handleRetry}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                                    >
                                        Return to Home
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Debug Info (dev only) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-4 bg-slate-100 rounded-lg text-xs">
                            <p className="font-semibold mb-2">Debug Info:</p>
                            <pre className="text-slate-600 overflow-auto">
                                {JSON.stringify({
                                    status,
                                    params: Object.fromEntries(searchParams)
                                }, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PaymentCallback;
