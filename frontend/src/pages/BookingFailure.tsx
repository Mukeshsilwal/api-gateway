import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { XCircle, Home, RefreshCw, AlertTriangle } from 'lucide-react';
import { UnifiedBookingResponse } from '../types/unifiedBooking';

/**
 * Booking Failure Page
 * Displays booking failure details with compensation information
 */
export const BookingFailure: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const bookingResponse = location.state?.bookingResponse as UnifiedBookingResponse;
    const error = location.state?.error as string;

    const getServiceIcon = (type: string) => {
        switch (type) {
            case 'EVENT': return '🎫';
            case 'HOTEL': return '🏨';
            case 'BUS': return '🚌';
            default: return '📦';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Failure Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-6 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Booking Failed
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {error || bookingResponse?.message || 'We encountered an issue processing your booking'}
                    </p>
                    {bookingResponse?.transactionId && (
                        <div className="inline-block bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
                            <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                                {bookingResponse.transactionId}
                            </p>
                        </div>
                    )}
                </div>

                {/* Compensation Notice */}
                {bookingResponse && bookingResponse.bookings.some(b => b.status === 'SUCCESS') && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                                    Automatic Compensation Applied
                                </h3>
                                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                    Some bookings were successful before the failure occurred. These bookings have been automatically cancelled and refunded to prevent partial bookings.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Booking Details */}
                {bookingResponse && bookingResponse.bookings.length > 0 && (
                    <div className="space-y-4 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Booking Attempts
                        </h2>

                        {bookingResponse.bookings.map((booking, index) => (
                            <div
                                key={index}
                                className={`bg-white dark:bg-gray-800 rounded-lg border p-6 ${booking.status === 'SUCCESS'
                                        ? 'border-yellow-200 dark:border-yellow-800'
                                        : 'border-red-200 dark:border-red-800'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{getServiceIcon(booking.type)}</span>
                                        <div>
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${booking.status === 'SUCCESS'
                                                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
                                                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
                                                }`}>
                                                {booking.type}
                                            </span>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {booking.status === 'SUCCESS' ? '⚠️ Cancelled (Compensated)' : '❌ Failed'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {booking.confirmationNumber && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Confirmation Number</span>
                                            <span className="font-mono font-medium text-gray-900 dark:text-white">
                                                {booking.confirmationNumber}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Message</span>
                                        <span className="text-gray-900 dark:text-white">{booking.message}</span>
                                    </div>
                                    {booking.status === 'SUCCESS' && (
                                        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded text-xs text-yellow-800 dark:text-yellow-300">
                                            This booking was automatically cancelled to maintain transaction integrity
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* What Happened */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        What Happened?
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                            <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                            <span>Your booking request was processed but encountered an error</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                            <span>No charges have been made to your account</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                            <span>Any successful bookings have been automatically cancelled</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                            <span>Your cart items have been preserved for retry</span>
                        </li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => navigate('/unified-checkout')}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        <span>Try Again</span>
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        <span>Back to Home</span>
                    </button>
                </div>

                {/* Support Notice */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        💬 Need help? Contact our support team with your transaction ID for assistance.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BookingFailure;
