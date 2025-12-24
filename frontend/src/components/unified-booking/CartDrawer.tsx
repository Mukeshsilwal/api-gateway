import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedBookingCart } from '../../hooks/useUnifiedBookingCart';
import { CartItem } from './CartItem';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Cart Drawer Component
 * Slide-out panel showing all cart items with checkout option
 */
export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const {
        cartItems,
        totalAmount,
        itemCount,
        removeFromCart,
        clearCart,
    } = useUnifiedBookingCart();

    const handleCheckout = () => {
        onClose();
        navigate('/unified-checkout');
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-orange-600" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Your Cart
                        </h2>
                        <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs font-semibold px-2 py-1 rounded-full">
                            {itemCount}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label="Close cart"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium">Your cart is empty</p>
                            <p className="text-sm mt-2">Add items to get started</p>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onRemove={removeFromCart}
                            />
                        ))
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
                        {/* Summary */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    NPR {totalAmount.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    Calculated at checkout
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                    NPR {totalAmount.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <button
                                onClick={handleCheckout}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <span>Proceed to Checkout</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            <button
                                onClick={clearCart}
                                className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
