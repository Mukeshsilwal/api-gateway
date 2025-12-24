import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { AlertCircle, RefreshCw, Home, XCircle } from 'lucide-react';
import analytics from '../services/analytics';

const EsewaFailure = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const errorMessage = searchParams.get('message') ||
        searchParams.get('error') ||
        'Your payment could not be processed.';
    const orderId = searchParams.get('oid') || searchParams.get('orderId');

    useEffect(() => {
        // Track payment failure
        analytics.trackEvent('payment_failure', {
            error: errorMessage,
            source: 'esewa',
            orderId: orderId || 'unknown'
        });
    }, [errorMessage, orderId]);

    const handleRetry = () => {
        // Navigate back to previous page to retry
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-purple-50 p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-l from-red-400/10 to-purple-400/10 skew-y-3 origin-top-right"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl"></div>

            <Card className="max-w-lg w-full text-center relative z-10 shadow-2xl border-red-100">
                <div className="py-8 px-6">
                    {/* Error Icon */}
                    <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
                        <XCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
                    </div>

                    {/* Error Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Failed</h1>
                    <p className="text-gray-600 mb-6">
                        We couldn't complete your transaction.
                    </p>

                    {/* Error Details */}
                    <div className="bg-gradient-to-br from-red-50 to-purple-50/30 p-5 rounded-2xl border border-red-200 mb-8">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="text-left flex-1">
                                <p className="text-sm font-semibold text-red-900 mb-1">Error Details</p>
                                <p className="text-sm text-red-700 leading-relaxed">
                                    {errorMessage}
                                </p>
                                {orderId && (
                                    <p className="text-xs text-gray-600 mt-3 font-mono bg-white px-3 py-2 rounded-lg border border-red-100">
                                        Order ID: {orderId}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Common Reasons */}
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-8 text-left">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Common Reasons:</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>Insufficient balance in your eSewa account</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>Payment cancelled by user</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>Network connection issues</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>Session timeout</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleRetry}
                            className="w-full gap-2 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 shadow-lg shadow-red-500/30"
                        >
                            <RefreshCw size={18} />
                            Try Again
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full gap-2 border-gray-300 hover:bg-gray-50"
                            onClick={handleGoHome}
                        >
                            <Home size={18} />
                            Return to Home
                        </Button>
                    </div>

                    {/* Help Text */}
                    <p className="text-xs text-gray-500 mt-6 leading-relaxed">
                        If the problem persists, please contact our support team or try a different payment method.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default EsewaFailure;
