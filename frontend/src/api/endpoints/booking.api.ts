/**
 * Booking and Payment API Clients
 */

import client from '../client';
import type { ApiResponse } from '../types/auth.types';
import type {
    BookingDto,
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    PaymentVerifyResponse,
    TransactionStatus,
} from '../types/booking.types';

export const bookingApi = {
    async getUserBookings(userId: number): Promise<BookingDto[]> {
        const response = await client.get<ApiResponse<BookingDto[]>>(
            `/bff/v1/booking/user/${userId}`
        );
        return response.data.data;
    },

    async getBookingDetails(bookingId: number): Promise<BookingDto> {
        const response = await client.get<ApiResponse<BookingDto>>(
            `/bff/v1/booking/${bookingId}`
        );
        return response.data.data;
    },

    async cancelBooking(bookingId: number, reason?: string): Promise<void> {
        await client.post(`/bff/v1/booking/${bookingId}/cancel`, { reason });
    },
};

export const paymentApi = {
    async initiatePayment(
        provider: string,
        request: PaymentInitiateRequest
    ): Promise<PaymentInitiateResponse> {
        const response = await client.post<ApiResponse<PaymentInitiateResponse>>(
            `/bff/v1/payment/initiate/${provider}`,
            request
        );
        return response.data.data;
    },

    async verifyPayment(
        provider: string,
        transactionId: string
    ): Promise<PaymentVerifyResponse> {
        const response = await client.post<ApiResponse<PaymentVerifyResponse>>(
            `/bff/v1/payment/verify/${provider}`,
            { transactionId }
        );
        return response.data.data;
    },

    async getPaymentStatus(transactionId: string): Promise<TransactionStatus> {
        const response = await client.get<ApiResponse<TransactionStatus>>(
            `/bff/v1/payment/status/${transactionId}`
        );
        return response.data.data;
    },

    async getTransaction(transactionId: string): Promise<TransactionStatus> {
        const response = await client.get<ApiResponse<TransactionStatus>>(
            `/bff/v1/payment/transaction/${transactionId}`
        );
        return response.data.data;
    },

    async getProviders(): Promise<any[]> {
        const response = await client.get<ApiResponse<any[]>>(
            `/bff/v1/payment/providers`
        );
        return response.data.data;
    },

    async cancelPayment(transactionId: string): Promise<void> {
        await client.post(`/bff/v1/payment/cancel/${transactionId}`);
    },
};
