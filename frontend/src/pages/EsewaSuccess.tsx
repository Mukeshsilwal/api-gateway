import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CheckCircle, Download, Home, Receipt } from 'lucide-react';
import analytics from '../services/analytics';

interface TransactionDetails {
    transactionId: string;
    orderId: string;
    amount: string;
    status: string;
}

const EsewaSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isVerifying, setIsVerifying] = useState(true);
    const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);

    useEffect(() => {
        // Extract eSewa callback parameters
        const data = searchParams.get('data');
        const oid = searchParams.get('oid');
        const amt = searchParams.get('amt');
        const refId = searchParams.get('refId');

        // Simulate verification (in real scenario, call backend to verify)
        setTimeout(() => {
            setIsVerifying(false);

            // Store transaction details
            const details: TransactionDetails = {
                transactionId: refId || oid || 'N/A',
                orderId: oid || 'N/A',
                amount: amt || '0',
                status: 'SUCCESS'
            };

            setTransactionDetails(details);

            // Track successful payment
            analytics.trackEvent('purchase', {
                transaction_id: details.transactionId,
                value: parseFloat(details.amount),
                currency: 'NPR',
                payment_method: 'esewa'
            });

            toast.success('Payment completed successfully!');
        }, 1500);
    }, [searchParams]);

    const handleDownloadTicket = () => {
        // Navigate to booking details or download ticket
        toast.info('Ticket download feature coming soon!');
    };

    const handleViewBooking = () => {
        navigate('/');
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4">
                <Card className="max-w-md w-full text-center p-12 shadow-2xl">
                    <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
                    <p className="text-gray-500">Please wait while we confirm your transaction...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-green-400/10 to-emerald-400/10 -skew-y-3 origin-top-left"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>

            <Card className="max-w-lg w-full text-center relative z-10 shadow-2xl border-green-100">
                <div className="py-8 px-6">
                    {/* Success Icon */}
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 animate-bounce">
                        <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
                    </div>

                    {/* Success Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
                    <p className="text-gray-600 mb-8 text-lg">
                        Your booking has been confirmed. Thank you for choosing us!
                    </p>

                    {/* Transaction Details */}
                    {transactionDetails && (
                        <div className="bg-gradient-to-br from-gray-50 to-green-50/30 p-6 rounded-2xl border border-green-100 mb-8 text-left space-y-4">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-green-200">
                                <Receipt className="w-5 h-5 text-green-600" />
                                <h3 className="font-bold text-gray-900">Transaction Details</h3>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">Transaction ID</span>
                                <span className="font-mono font-semibold text-gray-900 text-sm bg-white px-3 py-1 rounded-lg border border-gray-200">
                                    {transactionDetails.transactionId}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">Order ID</span>
                                <span className="font-mono font-medium text-gray-900 text-sm">
                                    {transactionDetails.orderId}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-green-100">
                                <span className="text-gray-600 font-semibold">Amount Paid</span>
                                <span className="font-bold text-green-600 text-2xl">
                                    NPR {parseFloat(transactionDetails.amount).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">Status</span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                    ✓ Completed
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleDownloadTicket}
                            className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30"
                        >
                            <Download size={18} />
                            Download Ticket
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full gap-2 border-green-200 hover:bg-green-50"
                            onClick={handleViewBooking}
                        >
                            <Home size={18} />
                            Return to Home
                        </Button>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-500">
                        <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                        <span>Secured by eSewa Payment Gateway</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default EsewaSuccess;
