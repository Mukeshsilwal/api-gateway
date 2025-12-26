import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { useUnifiedBookingCart } from '../hooks/useUnifiedBookingCart';
import { CartItem } from '../components/unified-booking';
import TripSelector from '../components/TripSelector';
import unifiedBookingPaymentService from '../services/unifiedBookingPaymentService';
import { setBookingContext } from '../utils/paymentStorage';
import toast from "react-hot-toast";
import analytics from '../services/analytics';

/**
 * Unified Checkout Page
 * Processes multi-service bookings in a single transaction
 */
export const UnifiedCheckout: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems, totalAmount } = useUnifiedBookingCart();

    const [isProcessing, setIsProcessing] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTripId, setSelectedTripId] = useState<number | null>(null);

    // Get customer ID from auth context or localStorage
    const customerId = localStorage.getItem('userId') || '1'; // Fallback for testing

    // Analytics: Track Checkout Started
    useState(() => {
        if (cartItems.length > 0) {
            analytics.trackEvent(analytics.Events.CHECKOUT_STARTED, {
                cart_size: cartItems.length,
                total_amount: totalAmount
            });
        }
    });

    const handleCheckout = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            // Build unified booking payload
            const payload = {
                customerId,
                tripId: selectedTripId, // Added tripId to the unified booking payload
                bookings: cartItems.map((item) => ({
                    type: item.type,
                    payload: {
                        ...item.payload,
                        customerId,
                    },
                })),
                totalAmount: totalAmount * 1.18 // Include fees and tax
            };

            analytics.trackEvent(analytics.Events.PAYMENT_INITIATED, {
                amount: payload.totalAmount,
                trip_linked: !!selectedTripId,
                item_count: payload.bookings.length
            });

            // Call unified booking payment service
            const response: any = await unifiedBookingPaymentService.completeUnifiedBooking(payload);

            const bookingData = response.data.bookingData;
            const paymentData = response.data.paymentData;

            // Associate bookings with trip happens automatically on backend now
            if (selectedTripId) {
                toast.success('Your bookings will be linked to your trip upon payment confirmation!');
            }

            // Store booking context for payment verification
            const contextToStore = {
                bookingId: bookingData.bookingId,
                amount: bookingData.totalAmount,
                htmlForm: paymentData.data.htmlForm,
                transactionId: paymentData.transactionId,
                bookingData: bookingData,
                isUnifiedBooking: true, // Flag to identify unified bookings
                tripId: selectedTripId // Store trip ID for post-payment association
            };

            setBookingContext(contextToStore);

            setIsRedirecting(true);

            // Navigate to payment redirect page
            navigate('/payment/redirect');

        } catch (err: any) {
            console.error('Checkout error:', err);
            setError(err.message || 'Failed to process booking. Please try again.');
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Your cart is empty
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Add some items to your cart to proceed with checkout
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                        Browse Services
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Checkout
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Review your bookings and complete your purchase
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/trips/create')}
                        className="text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1"
                    >
                        + Create a new Trip
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Your Bookings ({cartItems.length})
                        </h2>
                        {cartItems.map((item) => (
                            <CartItem key={item.id} item={item} onRemove={() => { }} />
                        ))}

                        {/* Trip Selection */}
                        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Link to a Trip</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Organize your bookings by linking them to a trip. This helps you track your itinerary and expenses.
                                </p>
                            </div>
                            <TripSelector
                                selectedTripId={selectedTripId}
                                onSelectTrip={setSelectedTripId}
                                bookingAmount={totalAmount * 1.18}
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Order Summary
                            </h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        NPR {totalAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Service Fee (5%)</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        NPR {(totalAmount * 0.05).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Tax (13%)</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        NPR {(totalAmount * 0.13).toLocaleString()}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                        NPR {(totalAmount * 1.18).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={isProcessing}
                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>{isRedirecting ? 'Redirecting to Payment...' : 'Processing...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        <span>Proceed to Payment</span>
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                                You will be redirected to eSewa for secure payment
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedCheckout;
