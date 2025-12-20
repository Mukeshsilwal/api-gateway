/**
 * Component Index
 * Export all DTO-driven components for easy importing
 */

// Cards
export { default as HotelCard } from './cards/HotelCard';
export { default as BusCard } from './cards/BusCard';

// Booking
export { default as SeatMap } from './booking/SeatMap';

// Displays
export { default as PriceBreakdown } from './displays/PriceBreakdown';
export { default as BookingTimeline } from './displays/BookingTimeline';
export { default as PaymentStatus } from './displays/PaymentStatus';

// Re-export types for convenience
export type { HotelDto, BusDto, SeatDto, BookingResponseDto, PaymentResponseDto, PricingResponseDto } from '../types/dto';
