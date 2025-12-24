import { useState } from 'react';
import { UnifiedBookingCart, CartDrawer } from './unified-booking';

/**
 * Cart Integration Component
 * Wraps the app with unified booking cart functionality
 */
const CartIntegration = ({ children }) => {
    const [isCartOpen, setIsCartOpen] = useState(false);

    return (
        <>
            {children}
            <UnifiedBookingCart onClick={() => setIsCartOpen(true)} />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
};

export default CartIntegration;
