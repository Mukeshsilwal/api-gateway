import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BookingStatus from '../components/BookingStatus';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { CheckCircle, Download, Home, AlertCircle } from 'lucide-react';
import analytics from '../services/analytics';
import paymentService from '../services/paymentService';
import { clearBookingContext } from '../utils/paymentStorage';

/**
 * PaymentSuccess Page
 * Handles eSewa success callback and completes booking
 * NO AUTHENTICATION REQUIRED - This is a public callback endpoint
 */
export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // State
    const [status, setStatus] = useState<'VERIFYING' | 'SUCCEEDED' | 'FAILED'>('VERIFYING');
    const [error, setError] = useState<string | null>(null);
    const [verificationResult, setVerificationResult] = useState<any>(null);
    const [decodedData, setDecodedData] = useState<any>(null);

    // Use ref to prevent double verification in StrictMode
    const verificationAttempted = useRef(false);

    useEffect(() => {
        const handleSuccess = async () => {
            if (verificationAttempted.current) return;
            verificationAttempted.current = true;

            const txnId = searchParams.get('txnId');
            let dataParam = searchParams.get('data');

            console.log('🔍 Processing Payment Success:', { txnId, hasData: !!dataParam });

            // 1. Handle Malformed URL (Edge Case) and Sanitize txnId
            if (txnId && txnId.includes('?')) {
                // If txnId contains query params locally (e.g. from a bad redirect)
                // We should clean it.
            }

            // Clean txnId if it has extra data appended
            const cleanTxnId = txnId ? txnId.split('?')[0] : null;

            if (!dataParam) {
                const searchString = window.location.search;
                if (searchString.includes('?data=')) {
                    const parts = searchString.split('?data=');
                    if (parts.length > 1) {
                        dataParam = parts[1].split('&')[0];
                    }
                }
            }

            // 2. Base64 Decoding
            let parsedData: any = null;
            try {
                if (dataParam) {
                    const decodedString = atob(dataParam);
                    parsedData = JSON.parse(decodedString);
                    setDecodedData(parsedData);
                    console.log('✅ Decoded eSewa Data:', parsedData);
                }
            } catch (e) {
                console.error('❌ Failed to decode parameter:', e);
                setError('Invalid payment data received.');
                setStatus('FAILED');
                toast.error('Invalid payment data received');
                return;
            }

            // 3. Validation
            const transactionUuid = cleanTxnId || parsedData?.transaction_uuid;

            if (!transactionUuid) {
                setError('Missing transaction ID.');
                setStatus('FAILED');
                toast.error('Missing transaction ID');
                return;
            }

            // Verify txnId matches data if both exist
            if (cleanTxnId && parsedData?.transaction_uuid && cleanTxnId !== parsedData.transaction_uuid) {
                console.warn('⚠️ Mismatch between param txnId and decoded transaction_uuid');
                toast.warning('Transaction ID mismatch detected');
            }

            // 4. Verification call - PUBLIC ENDPOINT (NO AUTH)
            try {
                // Confirm status is "COMPLETE" from eSewa before calling backend
                if (parsedData && parsedData.status !== 'COMPLETE') {
                    throw new Error(`Payment status is ${parsedData.status}`);
                }

                console.log('🚀 Verifying with backend:', transactionUuid);

                // Call request to BFF endpoint
                const result = await paymentService.verifyPaymentNew(transactionUuid, dataParam || '');

                console.log('✅ Verification Successful:', result);
                setVerificationResult(result);
                setStatus('SUCCEEDED');
                toast.success('Payment verified successfully!');

                // 5. Success cleanup & Analytics
                clearBookingContext();
                analytics.trackEvent('purchase', {
                    transaction_id: transactionUuid,
                    value: parsedData?.total_amount || result?.data?.amount,
                    currency: 'NPR',
                    payment_method: 'esewa'
                });

            } catch (err: any) {
                console.error('❌ Verification Failed:', err);
                setError(err.message || 'Payment verification failed.');
                setStatus('FAILED');
                toast.error(err.message || 'Payment verification failed');
            }
        };

        handleSuccess();
    }, [searchParams]);

    // Render: Loading / Verifying
    if (status === 'VERIFYING') {
        return (
            <BookingStatus
                state="verifying"
                message="Verifying your payment with eSewa..."
            />
        );
    }

    // Render: Failed
    if (status === 'FAILED') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="max-w-lg w-full p-8 text-center border-red-100 shadow-xl">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
                    <p className="text-gray-600 mb-6">{error || 'We could not verify your payment.'}</p>

                    {decodedData && (
                        <div className="bg-gray-50 rounded p-4 mb-6 text-left text-sm font-mono text-gray-600">
                            <p><strong>Transaction ID:</strong> {decodedData.transaction_uuid}</p>
                            <p><strong>Status:</strong> {decodedData.status}</p>
                            {decodedData.transaction_code && (
                                <p><strong>eSewa Code:</strong> {decodedData.transaction_code}</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                        >
                            Try Again
                        </Button>
                        <Button
                            onClick={() => navigate('/')}
                            variant="outline"
                            className="w-full"
                        >
                            <Home size={18} className="mr-2" />
                            Return to Home
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // Render: Success
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden font-sans">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/50 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full bg-white shadow-2xl rounded-3xl overflow-hidden relative z-10 ring-1 ring-black/5">
                {/* Success Header */}
                <div className="bg-emerald-600 p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.15)_1px,_transparent_0)] bg-[length:20px_20px]"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 ring-4 ring-white/20 shadow-lg animate-[bounce_1s_infinite]">
                            <CheckCircle className="w-10 h-10 text-white drop-shadow-md" strokeWidth={3} />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 tracking-tight">Payment Successful!</h1>
                        <p className="text-emerald-100 text-lg font-medium">Your booking has been confirmed</p>
                    </div>
                </div>

                {/* Ticket Details */}
                <div className="p-8">
                    {/* Amount */}
                    <div className="text-center mb-8 relative">
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Total Paid</p>
                        <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight">
                            <span className="text-2xl align-top text-gray-400 font-bold mr-1 mt-2 inline-block">NPR</span>
                            {Number(decodedData?.total_amount || verificationResult?.data?.amount || 0).toLocaleString()}
                        </h2>
                    </div>

                    {/* Receipt Card */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 relative overflow-hidden">
                        {/* Cutout decoration (pseudo-ticket look) */}
                        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white rounded-full border border-gray-100"></div>
                        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white rounded-full border border-gray-100"></div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-200 border-dashed">
                                <span className="text-xs text-gray-500 uppercase font-semibold">Transaction ID</span>
                                <span className="text-sm font-mono font-medium text-gray-900 truncate max-w-[150px]" title={decodedData?.transaction_uuid || verificationResult?.data?.transactionId}>
                                    {decodedData?.transaction_uuid || verificationResult?.data?.transactionId || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-200 border-dashed">
                                <span className="text-xs text-gray-500 uppercase font-semibold">Method</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-sm font-bold text-gray-900">eSewa Wallet</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 uppercase font-semibold">Date</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {verificationResult?.data?.verifiedAt
                                        ? new Date(verificationResult.data.verifiedAt).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'short', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })
                                        : new Date().toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'short', day: 'numeric'
                                        })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-xl text-lg font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all transform hover:-translate-y-0.5"
                            onClick={() => navigate('/')}
                        >
                            Return to Home
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-gray-500 hover:text-emerald-700 h-12 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
                            onClick={() => window.print()}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Download size={18} /> Download Receipt
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
