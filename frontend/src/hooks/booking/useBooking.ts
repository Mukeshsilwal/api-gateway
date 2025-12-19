/**
 * Booking and Payment React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi, paymentApi } from '@/api/endpoints/booking.api';
import type {
    PaymentInitiateRequest,
} from '@/api/types/booking.types';
import toast from 'react-hot-toast';

// Query Keys
export const bookingKeys = {
    all: ['bookings'] as const,
    lists: () => [...bookingKeys.all, 'list'] as const,
    list: (userId: number) => [...bookingKeys.lists(), userId] as const,
    details: () => [...bookingKeys.all, 'detail'] as const,
    detail: (id: number) => [...bookingKeys.details(), id] as const,
};

export const paymentKeys = {
    all: ['payments'] as const,
    status: (transactionId: string) => [...paymentKeys.all, 'status', transactionId] as const,
};

// Booking Queries
export const useBookings = (userId: number) => {
    return useQuery({
        queryKey: bookingKeys.list(userId),
        queryFn: () => bookingApi.getUserBookings(userId),
        staleTime: 1 * 60 * 1000,
        enabled: !!userId,
    });
};

export const useBookingDetails = (bookingId: number) => {
    return useQuery({
        queryKey: bookingKeys.detail(bookingId),
        queryFn: () => bookingApi.getBookingDetails(bookingId),
        staleTime: 2 * 60 * 1000,
        enabled: !!bookingId,
    });
};

// Booking Mutations
export const useCancelBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ bookingId, reason }: { bookingId: number; reason?: string }) =>
            bookingApi.cancelBooking(bookingId, reason),
        onSuccess: (_, variables) => {
            toast.success('Booking cancelled successfully');
            queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.bookingId) });
            queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to cancel booking');
        },
    });
};

// Payment Queries
export const usePaymentStatus = (transactionId: string) => {
    return useQuery({
        queryKey: paymentKeys.status(transactionId),
        queryFn: () => paymentApi.getPaymentStatus(transactionId),
        staleTime: 10 * 1000, // 10 seconds
        refetchInterval: 5 * 1000, // Poll every 5 seconds
        enabled: !!transactionId,
    });
};

// Payment Mutations
export const useInitiatePayment = () => {
    return useMutation({
        mutationFn: ({ provider, request }: { provider: string; request: PaymentInitiateRequest }) =>
            paymentApi.initiatePayment(provider, request),
        onSuccess: (data) => {
            // Redirect to payment URL
            window.location.href = data.paymentUrl;
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to initiate payment');
        },
    });
};

export const useVerifyPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ provider, transactionId }: { provider: string; transactionId: string }) =>
            paymentApi.verifyPayment(provider, transactionId),
        onSuccess: (data) => {
            if (data.status === 'SUCCESS') {
                toast.success('Payment verified successfully');
                queryClient.invalidateQueries({ queryKey: bookingKeys.all });
            } else {
                toast.error('Payment verification failed');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to verify payment');
        },
    });
};

export const usePaymentProviders = () => {
    return useQuery({
        queryKey: [...paymentKeys.all, 'providers'],
        queryFn: () => paymentApi.getProviders(),
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
};

export const useTransactionDetails = (transactionId: string) => {
    return useQuery({
        queryKey: [...paymentKeys.all, 'transaction', transactionId],
        queryFn: () => paymentApi.getTransaction(transactionId),
        staleTime: 30 * 1000,
        enabled: !!transactionId,
    });
};

export const useCancelPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (transactionId: string) => paymentApi.cancelPayment(transactionId),
        onSuccess: () => {
            toast.success('Payment cancelled successfully');
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to cancel payment');
        },
    });
};
