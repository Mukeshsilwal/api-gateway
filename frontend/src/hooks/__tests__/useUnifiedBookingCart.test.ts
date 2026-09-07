import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUnifiedBookingCart } from '../useUnifiedBookingCart';

describe('useUnifiedBookingCart Hook', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('initializes with an empty cart', () => {
        const { result } = renderHook(() => useUnifiedBookingCart());

        expect(result.current.cartItems).toEqual([]);
        expect(result.current.itemCount).toBe(0);
        expect(result.current.totalAmount).toBe(0);
        expect(result.current.hasItems).toBe(false);
    });

    it('adds bus, hotel, and event items to unified cart and calculates total amount', () => {
        const { result } = renderHook(() => useUnifiedBookingCart());

        act(() => {
            result.current.addToCart({
                type: 'BUS',
                title: 'Kathmandu to Pokhara Deluxe Bus',
                amount: 1500,
                serviceId: 'bus-101',
                details: { seatNumber: 'A1', departureDate: '2026-09-15' }
            });
        });

        expect(result.current.itemCount).toBe(1);
        expect(result.current.totalAmount).toBe(1500);
        expect(result.current.hasItems).toBe(true);

        act(() => {
            result.current.addToCart({
                type: 'HOTEL',
                title: 'Hotel Annapurna Deluxe Room',
                amount: 8000,
                serviceId: 'hotel-202',
                details: { checkIn: '2026-09-15', checkOut: '2026-09-16', rooms: 1 }
            });
        });

        act(() => {
            result.current.addToCart({
                type: 'EVENT',
                title: 'Kathmandu Music Fest - VIP Pass',
                amount: 2500,
                serviceId: 'event-303',
                details: { tier: 'VIP', quantity: 1 }
            });
        });

        expect(result.current.itemCount).toBe(3);
        expect(result.current.totalAmount).toBe(12000); // 1500 + 8000 + 2500
        expect(result.current.cartSummary.BUS.length).toBe(1);
        expect(result.current.cartSummary.HOTEL.length).toBe(1);
        expect(result.current.cartSummary.EVENT.length).toBe(1);
    });

    it('removes item from cart and updates totals', () => {
        const { result } = renderHook(() => useUnifiedBookingCart());

        let busItemId: string;
        act(() => {
            busItemId = result.current.addToCart({
                type: 'BUS',
                title: 'Bus Ticket',
                amount: 1200,
                serviceId: 'bus-1'
            });
        });

        act(() => {
            result.current.addToCart({
                type: 'EVENT',
                title: 'Event Ticket',
                amount: 800,
                serviceId: 'event-1'
            });
        });

        expect(result.current.itemCount).toBe(2);
        expect(result.current.totalAmount).toBe(2000);

        act(() => {
            result.current.removeFromCart(busItemId);
        });

        expect(result.current.itemCount).toBe(1);
        expect(result.current.totalAmount).toBe(800);
        expect(result.current.cartItems[0].type).toBe('EVENT');
    });

    it('clears entire cart and localStorage', () => {
        const { result } = renderHook(() => useUnifiedBookingCart());

        act(() => {
            result.current.addToCart({
                type: 'BUS',
                title: 'Bus Ticket',
                amount: 1200,
                serviceId: 'bus-1'
            });
        });

        expect(result.current.itemCount).toBe(1);

        act(() => {
            result.current.clearCart();
        });

        expect(result.current.cartItems).toEqual([]);
        expect(result.current.itemCount).toBe(0);
        const stored = JSON.parse(localStorage.getItem('unified_booking_cart') || '{"items":[]}');
        expect(stored.items).toEqual([]);
    });
});
