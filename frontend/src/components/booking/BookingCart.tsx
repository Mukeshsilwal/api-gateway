import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBookingCart, CartItem } from '../../hooks/useBookingCart';
import { createUnifiedBooking } from '../../api/unifiedBooking';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { ShoppingCart, Trash2, Calendar, MapPin, Hotel, Bus, Ticket, X } from 'lucide-react';

interface BookingCartProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BookingCart: React.FC<BookingCartProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { items, removeItem, clearCart, totalAmount, itemCount } = useBookingCart();
    const [loading, setLoading] = useState(false);

    // Get user info from localStorage (adjust based on your auth implementation)
    const getUserInfo = () => {
        const userStr = localStorage.getItem('user');
        const tokenStr = localStorage.getItem('token');
        if (userStr && tokenStr) {
            try {
                const user = JSON.parse(userStr);
                return { user, token: tokenStr };
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    const handleCheckout = async () => {
        const authInfo = getUserInfo();

        if (!authInfo) {
            toast.error('Please login to continue');
            navigate('/login');
            return;
        }

        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setLoading(true);

        try {
            const bookingRequest = {
                customerId: authInfo.user.id || authInfo.user.userId,
                bookings: items.map(item => ({
                    type: item.type,
                    payload: {
                        ...item.details,
                        amount: item.amount,
                        provider: 'standard'
                    }
                }))
            };

            await createUnifiedBooking(bookingRequest, authInfo.token);

            toast.success('Booking successful! Redirecting...');
            clearCart();

            // Redirect to confirmation page
            setTimeout(() => {
                navigate('/booking-confirmation');
            }, 1500);

        } catch (error) {
            console.error('Booking error:', error);
            const message = error instanceof Error ? error.message : 'Booking failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const getItemIcon = (type: CartItem['type']) => {
        switch (type) {
            case 'EVENT':
                return <Ticket className="w-5 h-5" />;
            case 'BUS':
                return <Bus className="w-5 h-5" />;
            case 'HOTEL':
                return <Hotel className="w-5 h-5" />;
        }
    };

    const getItemTypeColor = (type: CartItem['type']) => {
        switch (type) {
            case 'EVENT':
                return 'bg-purple-100 text-purple-800';
            case 'BUS':
                return 'bg-blue-100 text-blue-800';
            case 'HOTEL':
                return 'bg-green-100 text-green-800';
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Cart Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="w-6 h-6" />
                            <div>
                                <h2 className="text-xl font-bold">Booking Cart</h2>
                                <p className="text-sm text-indigo-100">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                            <p className="text-gray-500 mb-4">Add events, buses, or hotels to get started</p>
                            <Button onClick={onClose} variant="outline">
                                Continue Browsing
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                                    <div className="flex gap-4">
                                        {/* Item Image */}
                                        {item.imageUrl && (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                            />
                                        )}

                                        {/* Item Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getItemTypeColor(item.type)}`}>
                                                            {getItemIcon(item.type)}
                                                            {item.type}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-1 hover:bg-red-50 rounded-full text-red-600 transition-colors flex-shrink-0"
                                                    title="Remove from cart"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Additional Info */}
                                            {item.date && (
                                                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{item.date}</span>
                                                </div>
                                            )}
                                            {item.description && (
                                                <p className="text-sm text-gray-500 truncate mb-2">{item.description}</p>
                                            )}

                                            {/* Price */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold text-indigo-600">
                                                    NPR {item.amount.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                        {/* Total */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-semibold">NPR {totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Platform Fee</span>
                                <span className="font-semibold">NPR {(totalAmount * 0.02).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Tax (13%)</span>
                                <span className="font-semibold">NPR {(totalAmount * 0.13).toLocaleString()}</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-indigo-600">
                                    NPR {(totalAmount * 1.15).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <Button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-lg font-semibold"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processing...
                                    </span>
                                ) : (
                                    `Checkout (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`
                                )}
                            </Button>
                            <Button
                                onClick={clearCart}
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                            >
                                Clear Cart
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
