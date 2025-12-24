import { ShoppingCart } from 'lucide-react';
import { useUnifiedBookingCart } from '../../hooks/useUnifiedBookingCart';

interface UnifiedBookingCartProps {
    onClick?: () => void;
}

/**
 * Floating Cart Icon Component
 * Shows cart item count and opens cart drawer on click
 */
export const UnifiedBookingCart: React.FC<UnifiedBookingCartProps> = ({ onClick }) => {
    const { itemCount, totalAmount } = useUnifiedBookingCart();

    if (itemCount === 0) {
        return null; // Hide cart when empty
    }

    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-50 group"
            aria-label={`Shopping cart with ${itemCount} items`}
        >
            {/* Cart Button */}
            <div className="relative bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
                <ShoppingCart className="w-6 h-6" />

                {/* Item Count Badge */}
                {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                        {itemCount > 9 ? '9+' : itemCount}
                    </span>
                )}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                    <div className="font-semibold">{itemCount} {itemCount === 1 ? 'item' : 'items'} in cart</div>
                    <div className="text-purple-300">NPR {totalAmount.toLocaleString()}</div>
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
            </div>
        </button>
    );
};

export default UnifiedBookingCart;
