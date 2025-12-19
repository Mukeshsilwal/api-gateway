/**
 * Booking, Payment, and Market Types
 */

export interface BookingDto {
    id: number;
    userId: number;
    bookingType: 'HOTEL' | 'BUS' | 'EVENT';
    referenceId: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    totalAmount: number;
    currency: string;
    bookingDate: string;
}

export interface PaymentInitiateRequest {
    amount: number;
    currency: string;
    bookingId: number;
    returnUrl: string;
}

export interface PaymentInitiateResponse {
    transactionId: string;
    paymentUrl: string;
    expiresAt: string;
}

export interface PaymentVerifyResponse {
    transactionId: string;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    amount: number;
    currency: string;
    paidAt?: string;
}

export interface TransactionStatus {
    transactionId: string;
    status: string;
    amount: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
}
