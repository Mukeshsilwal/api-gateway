import { ShoppingCart } from 'lucide-react';
import { useBookingCart } from '../../hooks/useBookingCart';

interface CartIconProps {
    onClick: () => void;
}

export const CartIcon: React.FC<CartIconProps> = ({ onClick }) => {
    const { itemCount, totalAmount } = useBookingCart();

    // Cart is now in the navbar, so we don't need the floating button
    return null;
};
