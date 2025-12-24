// Unified Booking Type Definitions

export type BookingServiceType = 'EVENT' | 'HOTEL' | 'BUS';

export interface CartItem {
    id: string;
    type: BookingServiceType;
    name: string;
    amount: number;
    payload: Record<string, any>;
    metadata: CartItemMetadata;
    addedAt: string;
}

export interface CartItemMetadata {
    // Common fields
    description?: string;
    imageUrl?: string;

    // Event-specific
    eventDate?: string;
    eventLocation?: string;
    ticketType?: string;
    quantity?: number;

    // Hotel-specific
    checkIn?: string;
    checkOut?: string;
    roomType?: string;
    guests?: number;
    nights?: number;

    // Bus-specific
    departureTime?: string;
    arrivalTime?: string;
    from?: string;
    to?: string;
    seatNumbers?: string[];
}

export interface UnifiedBookingRequest {
    customerId: string;
    bookings: BookingRequestItem[];
}

export interface BookingRequestItem {
    type: BookingServiceType;
    payload: Record<string, any>;
}

export interface UnifiedBookingResponse {
    transactionId: string;
    customerId: string;
    bookings: BookingResult[];
    totalAmount: number;
    status: 'SUCCESS' | 'FAILED' | 'PARTIAL_SUCCESS';
    createdAt: string;
    message: string;
    paymentInfo?: PaymentInfo;
}

export interface BookingResult {
    type: BookingServiceType;
    bookingId: string;
    confirmationNumber: string;
    status: 'SUCCESS' | 'FAILED';
    amount: number;
    message: string;
    details?: any;
}

export interface PaymentInfo {
    paymentId?: string;
    paymentMethod?: string;
    paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
    amount: number;
    currency: string;
    paymentUrl?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    code: string;
    message: string;
    data: T;
    status: any;
    timestamp: string;
}
