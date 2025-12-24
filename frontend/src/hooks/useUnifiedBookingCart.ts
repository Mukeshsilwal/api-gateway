import { useState, useEffect, useCallback } from 'react';
import { CartItem, BookingServiceType } from '../types/unifiedBooking';

const CART_STORAGE_KEY = 'unified_booking_cart';
const CART_EXPIRY_HOURS = 24;

/**
 * Unified Booking Cart Hook
 * Manages cart state for multi-service bookings
 */
export const useUnifiedBookingCart = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load cart from localStorage on mount
    useEffect(() => {
        loadCart();
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (!isLoading) {
            saveCart(cartItems);
        }
    }, [cartItems, isLoading]);

    /**
     * Load cart from localStorage
     */
    const loadCart = useCallback(() => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);

                // Check expiry
                if (parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
                    setCartItems(parsed.items || []);
                } else {
                    // Cart expired, clear it
                    localStorage.removeItem(CART_STORAGE_KEY);
                }
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Save cart to localStorage
     */
    const saveCart = useCallback((items: CartItem[]) => {
        try {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + CART_EXPIRY_HOURS);

            localStorage.setItem(
                CART_STORAGE_KEY,
                JSON.stringify({
                    items,
                    expiresAt: expiresAt.toISOString(),
                })
            );
        } catch (error) {
            console.error('Failed to save cart:', error);
        }
    }, []);

    /**
     * Add item to cart
     */
    const addToCart = useCallback((item: Omit<CartItem, 'id' | 'addedAt'>) => {
        const newItem: CartItem = {
            ...item,
            id: `${item.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            addedAt: new Date().toISOString(),
        };

        setCartItems((prev) => [...prev, newItem]);
        return newItem.id;
    }, []);

    /**
     * Remove item from cart
     */
    const removeFromCart = useCallback((itemId: string) => {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    }, []);

    /**
     * Update item in cart
     */
    const updateCartItem = useCallback((itemId: string, updates: Partial<CartItem>) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
            )
        );
    }, []);

    /**
     * Clear entire cart
     */
    const clearCart = useCallback(() => {
        setCartItems([]);
        localStorage.removeItem(CART_STORAGE_KEY);
    }, []);

    /**
     * Get items by type
     */
    const getItemsByType = useCallback(
        (type: BookingServiceType) => {
            return cartItems.filter((item) => item.type === type);
        },
        [cartItems]
    );

    /**
     * Calculate total amount
     */
    const totalAmount = cartItems.reduce((sum, item) => sum + item.amount, 0);

    /**
     * Get item count
     */
    const itemCount = cartItems.length;

    /**
     * Check if cart has items
     */
    const hasItems = itemCount > 0;

    /**
     * Get cart summary by type
     */
    const cartSummary = {
        EVENT: getItemsByType('EVENT'),
        HOTEL: getItemsByType('HOTEL'),
        BUS: getItemsByType('BUS'),
    };

    return {
        // State
        cartItems,
        isLoading,
        totalAmount,
        itemCount,
        hasItems,
        cartSummary,

        // Actions
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        getItemsByType,
    };
};

export default useUnifiedBookingCart;
