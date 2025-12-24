import { useLocation, useNavigate } from 'react-router-dom';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';

interface BookingData {
    bookingId?: string;
    transactionId?: string;
    amount?: string | number;
}

interface LocationState {
    status?: 'success' | 'failed' | 'error' | 'pending';
    title?: string;
    message?: string;
    bookingData?: BookingData;
    redirectUrl?: string;
    autoRedirect?: boolean;
}

/**
 * PaymentStatus Component
 * Displays payment status with visual feedback
 * Can be used for success, failure, or pending states
 */
const PaymentStatus = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        status = 'pending',
        title,
        message,
        bookingData,
        redirectUrl,
        autoRedirect = true
    } = (location.state || {}) as LocationState;

    React.useEffect(() => {
        if (autoRedirect && redirectUrl && status === 'success') {
            const timer = setTimeout(() => {
                navigate(redirectUrl);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [autoRedirect, redirectUrl, status, navigate]);

    const getStatusConfig = () => {
        switch (status) {
            case 'success':
                return {
                    icon: (
                        <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-600',
                    title: title || 'Payment Successful!',
                    message: message || 'Your payment has been processed successfully.'
                };
            case 'failed':
            case 'error':
                return {
                    icon: (
                        <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-600',
                    title: title || 'Payment Failed',
                    message: message || 'Your payment could not be processed. Please try again.'
                };
            case 'pending':
            default:
                return {
                    icon: (
                        <svg className="w-16 h-16 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ),
                    bgColor: 'bg-yellow-100',
                    textColor: 'text-yellow-600',
                    title: title || 'Processing Payment',
                    message: message || 'Please wait while we process your payment...'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <NavigationBar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-200 text-center">
                        {/* Icon */}
                        <div className={`mx-auto w-24 h-24 rounded-full ${config.bgColor} flex items-center justify-center mb-6`}>
                            {config.icon}
                        </div>

                        {/* Title */}
                        <h1 className={`text-3xl font-bold mb-4 ${config.textColor}`}>
                            {config.title}
                        </h1>

                        {/* Message */}
                        <p className="text-slate-600 text-lg mb-8">
                            {config.message}
                        </p>

                        {/* Booking Details (if available) */}
                        {bookingData && (
                            <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left">
                                <h3 className="font-semibold text-slate-900 mb-4">Booking Details</h3>
                                <div className="space-y-2 text-sm">
                                    {bookingData.bookingId && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Booking ID:</span>
                                            <span className="font-medium text-slate-900">{bookingData.bookingId}</span>
                                        </div>
                                    )}
                                    {bookingData.transactionId && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Transaction ID:</span>
                                            <span className="font-medium text-slate-900">{bookingData.transactionId}</span>
                                        </div>
                                    )}
                                    {bookingData.amount && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Amount:</span>
                                            <span className="font-medium text-slate-900">NPR {bookingData.amount}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 justify-center">
                            {status === 'success' && (
                                <>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
                                    >
                                        Back to Home
                                    </button>
                                    {redirectUrl && (
                                        <button
                                            onClick={() => navigate(redirectUrl)}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                                        >
                                            View Booking
                                        </button>
                                    )}
                                </>
                            )}

                            {(status === 'failed' || status === 'error') && (
                                <>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
                                    >
                                        Back to Home
                                    </button>
                                    <button
                                        onClick={() => navigate(-2)}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Auto-redirect message */}
                        {status === 'success' && autoRedirect && redirectUrl && (
                            <p className="text-sm text-slate-500 mt-6">
                                Redirecting to booking details in 3 seconds...
                            </p>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PaymentStatus;
