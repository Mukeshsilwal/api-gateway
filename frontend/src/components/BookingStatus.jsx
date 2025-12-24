import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { PAYMENT_STATES } from '../hooks/useEsewaPayment';

/**
 * Reusable component for displaying booking/payment status
 * Shows appropriate UI for each state with loading indicators
 */
export default function BookingStatus({ state, retryCount, pollingAttempt, message, error }) {
    const getStatusConfig = () => {
        switch (state) {
            case PAYMENT_STATES.INITIATING:
                return {
                    icon: <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />,
                    title: 'Creating Your Booking',
                    description: message || 'Please wait while we prepare your booking...',
                    bgColor: 'from-blue-50 to-indigo-50',
                    iconBg: 'bg-blue-100'
                };

            case PAYMENT_STATES.REDIRECTING:
                return {
                    icon: <RefreshCw className="w-12 h-12 text-green-600 animate-spin" />,
                    title: 'Redirecting to eSewa',
                    description: message || 'You will be redirected to eSewa payment gateway...',
                    bgColor: 'from-green-50 to-emerald-50',
                    iconBg: 'bg-green-100'
                };

            case PAYMENT_STATES.VERIFYING:
                return {
                    icon: <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />,
                    title: 'Verifying Payment',
                    description: message || 'Confirming your payment with eSewa...',
                    bgColor: 'from-purple-50 to-violet-50',
                    iconBg: 'bg-purple-100'
                };

            case PAYMENT_STATES.COMPLETING:
                return {
                    icon: <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />,
                    title: 'Finalizing Booking',
                    description: message || `Completing your booking... ${retryCount > 0 ? `(Retry ${retryCount}/3)` : ''}`,
                    bgColor: 'from-purple-50 to-amber-50',
                    iconBg: 'bg-purple-100',
                    showWarning: retryCount > 0,
                    warningText: 'Please do not refresh or close this page'
                };

            case PAYMENT_STATES.POLLING:
                return {
                    icon: <Clock className="w-12 h-12 text-yellow-600 animate-pulse" />,
                    title: 'Checking Booking Status',
                    description: message || `Verifying your booking status... (${pollingAttempt}/10)`,
                    bgColor: 'from-yellow-50 to-purple-50',
                    iconBg: 'bg-yellow-100',
                    showWarning: true,
                    warningText: 'This may take a moment. Please do not refresh the page.'
                };

            case PAYMENT_STATES.CONFIRMED:
                return {
                    icon: <CheckCircle2 className="w-12 h-12 text-green-600" />,
                    title: 'Booking Confirmed!',
                    description: message || 'Your booking has been successfully confirmed.',
                    bgColor: 'from-green-50 to-emerald-50',
                    iconBg: 'bg-green-100'
                };

            case PAYMENT_STATES.FAILED:
                return {
                    icon: <AlertCircle className="w-12 h-12 text-red-600" />,
                    title: 'Booking Failed',
                    description: error || message || 'We encountered an issue processing your booking.',
                    bgColor: 'from-red-50 to-rose-50',
                    iconBg: 'bg-red-100',
                    showError: true
                };

            default:
                return {
                    icon: <Loader2 className="w-12 h-12 text-gray-600 animate-spin" />,
                    title: 'Processing',
                    description: message || 'Please wait...',
                    bgColor: 'from-gray-50 to-slate-50',
                    iconBg: 'bg-gray-100'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${config.bgColor} p-4`}>
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Icon */}
                    <div className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
                        {config.icon}
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {config.title}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {config.description}
                    </p>

                    {/* Warning Message */}
                    {config.showWarning && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-yellow-800 font-medium flex items-center justify-center gap-2">
                                <AlertCircle size={16} />
                                {config.warningText}
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {config.showError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-red-800">
                                {error || 'An error occurred. Please contact support if this persists.'}
                            </p>
                        </div>
                    )}

                    {/* Progress Indicator */}
                    {(state === PAYMENT_STATES.COMPLETING || state === PAYMENT_STATES.POLLING) && (
                        <div className="mt-6">
                            <div className="flex justify-between text-xs text-gray-500 mb-2">
                                <span>Progress</span>
                                <span>
                                    {state === PAYMENT_STATES.COMPLETING
                                        ? `Attempt ${retryCount + 1}/4`
                                        : `Check ${pollingAttempt}/10`}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: state === PAYMENT_STATES.COMPLETING
                                            ? `${((retryCount + 1) / 4) * 100}%`
                                            : `${(pollingAttempt / 10) * 100}%`
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
