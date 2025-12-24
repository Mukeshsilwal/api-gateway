import { PaymentResponseDto } from '../../types/dto';
import { CheckCircle, XCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';

interface PaymentStatusProps {
    payment: PaymentResponseDto;
    onRetry?: () => void;
}

/**
 * Payment Status Component
 * Displays payment status using PaymentResponseDto
 */
const PaymentStatus: React.FC<PaymentStatusProps> = ({ payment, onRetry }) => {
    const getStatusConfig = () => {
        switch (payment.status) {
            case 'PAID':
                return {
                    icon: CheckCircle,
                    color: 'green',
                    title: 'Payment Successful',
                    message: 'Your payment has been processed successfully.',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    textColor: 'text-green-700',
                    iconColor: 'text-green-500',
                };
            case 'FAILED':
                return {
                    icon: XCircle,
                    color: 'red',
                    title: 'Payment Failed',
                    message: payment.message || 'Your payment could not be processed. Please try again.',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    textColor: 'text-red-700',
                    iconColor: 'text-red-500',
                };
            case 'PENDING':
                return {
                    icon: Clock,
                    color: 'yellow',
                    title: 'Payment Pending',
                    message: 'Your payment is being processed. Please wait...',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    textColor: 'text-yellow-700',
                    iconColor: 'text-yellow-500',
                };
            default:
                return {
                    icon: AlertCircle,
                    color: 'gray',
                    title: 'Payment Status Unknown',
                    message: 'Unable to determine payment status.',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    textColor: 'text-gray-700',
                    iconColor: 'text-gray-500',
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    const formatExpiry = (expiresAt?: string) => {
        if (!expiresAt) return null;
        const expiry = new Date(expiresAt);
        const now = new Date();
        const diff = expiry.getTime() - now.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes <= 0) return 'Expired';
        if (minutes < 60) return `Expires in ${minutes} minutes`;
        const hours = Math.floor(minutes / 60);
        return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
    };

    return (
        <div className={`rounded-xl border-2 ${config.borderColor} ${config.bgColor} p-6`}>
            {/* Status Icon & Title */}
            <div className="flex items-start gap-4 mb-4">
                <div className={`flex-shrink-0 w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center border-2 ${config.borderColor}`}>
                    <Icon className={config.iconColor} size={32} />
                </div>
                <div className="flex-1">
                    <h3 className={`text-xl font-bold ${config.textColor} mb-1`}>
                        {config.title}
                    </h3>
                    <p className={`text-sm ${config.textColor} opacity-90`}>
                        {config.message}
                    </p>
                </div>
            </div>

            {/* Transaction Details */}
            <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Transaction ID</span>
                    <span className="font-mono text-sm font-semibold text-gray-900">
                        {payment.transactionId}
                    </span>
                </div>

                {payment.expiresAt && payment.status === 'PENDING' && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Expires</span>
                        <span className="text-sm font-semibold text-purple-600">
                            {formatExpiry(payment.expiresAt)}
                        </span>
                    </div>
                )}
            </div>

            {/* Payment URL for Pending */}
            {payment.paymentUrl && payment.status === 'PENDING' && (
                <div className="mt-4">
                    <a
                        href={payment.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                    >
                        <span>Complete Payment</span>
                        <ExternalLink size={18} />
                    </a>
                </div>
            )}

            {/* QR Code for Pending */}
            {payment.qrCode && payment.status === 'PENDING' && (
                <div className="mt-4 bg-white rounded-lg p-4">
                    <div className="text-center mb-3">
                        <span className="text-sm font-semibold text-gray-700">Scan to Pay</span>
                    </div>
                    <div className="flex justify-center">
                        <img
                            src={payment.qrCode}
                            alt="Payment QR Code"
                            className="w-48 h-48 border-2 border-gray-200 rounded-lg"
                        />
                    </div>
                </div>
            )}

            {/* Retry Button for Failed */}
            {payment.status === 'FAILED' && onRetry && (
                <div className="mt-4">
                    <button
                        onClick={onRetry}
                        className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                    >
                        Retry Payment
                    </button>
                </div>
            )}

            {/* Success Actions */}
            {payment.status === 'PAID' && (
                <div className="mt-4 flex gap-3">
                    <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold">
                        View Booking
                    </button>
                    <button className="flex-1 px-4 py-2 bg-white border-2 border-green-500 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-semibold">
                        Download Receipt
                    </button>
                </div>
            )}
        </div>
    );
};

export default PaymentStatus;
