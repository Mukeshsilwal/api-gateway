import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Calendar } from 'lucide-react';
import { UnifiedBookingResponse } from '../types/unifiedBooking';

/**
 * Booking Success Page
 * Displays successful booking details with download options
 */
export const BookingSuccess: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const bookingResponse = location.state?.bookingResponse as UnifiedBookingResponse;

    if (!bookingResponse) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No booking information found</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

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
                {/* Success Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-6 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Booking Successful!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Your bookings have been confirmed
                    </p>
                    <div className="inline-block bg-orange-100 dark:bg-orange-900/20 px-4 py-2 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
                        <p className="text-lg font-mono font-semibold text-orange-600 dark:text-orange-400">
                            {bookingResponse.transactionId}
                        </p>
                    </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-4 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Booking Details
                    </h2>

                    {bookingResponse.bookings.map((booking, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{getServiceIcon(booking.type)}</span>
                                    <div>
                                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                                            {booking.type}
                                        </span>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {booking.status === 'SUCCESS' ? '✅ Confirmed' : '❌ Failed'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                        NPR {booking.amount.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Booking ID</span>
                                    <span className="font-mono font-medium text-gray-900 dark:text-white">
                                        {booking.bookingId}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Confirmation Number</span>
                                    <span className="font-mono font-medium text-gray-900 dark:text-white">
                                        {booking.confirmationNumber}
                                    </span>
                                </div>
                                {booking.message && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                                        <span className="text-gray-900 dark:text-white">{booking.message}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            Total Amount
                        </span>
                        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            NPR {bookingResponse.totalAmount.toLocaleString()}
                        </span>
                    </div>
                    {bookingResponse.paymentInfo && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Payment Status: {bookingResponse.paymentInfo.paymentStatus}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Calendar className="w-5 h-5" />
                        <span>View My Bookings</span>
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        <span>Back to Home</span>
                    </button>
                </div>

                {/* Email Confirmation Notice */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        📧 Confirmation emails have been sent to your registered email address with detailed booking information and QR codes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccess;
