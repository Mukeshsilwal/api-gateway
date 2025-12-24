import { useState, useCallback, useEffect } from 'react';

export interface CartItem {
    id: string;
    type: 'EVENT' | 'BUS' | 'HOTEL';
    name: string;
    amount: number;
    details: any;
    imageUrl?: string;
    date?: string;
    description?: string;
}

const CART_STORAGE_KEY = 'booking_cart';

export const useBookingCart = () => {
    const [items, setItems] = useState<CartItem[]>(() => {
        // Load from localStorage on init
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    console.error('Failed to parse cart from localStorage', e);
                    return [];
                }
            }
        }
        return [];
    });

    // Persist to localStorage whenever items change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        }
    }, [items]);

    const addItem = useCallback((item: CartItem) => {
        setItems(prev => {
            // Check if item already exists (by id)
            const exists = prev.find(i => i.id === item.id);
            if (exists) {
                console.warn('Item already in cart:', item.id);
                return prev;
            }
            return [...prev, item];
        });
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    }, []);

    const updateItem = useCallback((id: string, updates: Partial<CartItem>) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(CART_STORAGE_KEY);
        }
    }, []);

    const getItemsByType = useCallback((type: CartItem['type']) => {
        return items.filter(item => item.type === type);
    }, [items]);

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const itemCount = items.length;

    const hasItemType = useCallback((type: CartItem['type']) => {
        return items.some(item => item.type === type);
    }, [items]);

    return {
        items,
        addItem,
        removeItem,
        updateItem,
        clearCart,
        getItemsByType,
        totalAmount,
        itemCount,
        hasItemType,
    };
};
