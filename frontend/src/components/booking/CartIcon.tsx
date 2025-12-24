import { ShoppingCart } from 'lucide-react';
import { useBookingCart } from '../../hooks/useBookingCart';

interface CartIconProps {
    onClick: () => void;
}

export const CartIcon: React.FC<CartIconProps> = ({ onClick }) => {
    const { itemCount, totalAmount } = useBookingCart();

    if (itemCount === 0) return null;

    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-30 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
            aria-label="Open booking cart"
        >
            <div className="relative p-4">
                <ShoppingCart className="w-6 h-6" />

                {/* Item Count Badge */}
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                        {itemCount > 9 ? '9+' : itemCount}
                    </span>
                )}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    <div className="font-semibold">{itemCount} {itemCount === 1 ? 'item' : 'items'} in cart</div>
                    <div className="text-xs text-gray-300">NPR {totalAmount.toLocaleString()}</div>
                    <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                </div>
            </div>
        </button>
    );
};
