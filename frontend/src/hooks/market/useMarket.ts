/**
 * Additional React Query Hooks for Complete API Coverage
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, marketApi } from '@/api/endpoints';
import toast from 'react-hot-toast';

// ==================== Additional Auth Hooks ====================

export const useActiveSessions = (username: string) => {
    return useQuery({
        queryKey: ['auth', 'sessions', username],
        queryFn: () => authApi.getActiveSessions(username),
        staleTime: 30 * 1000, // 30 seconds
        enabled: !!username,
    });
};

export const useUserActivity = (username: string) => {
    return useQuery({
        queryKey: ['auth', 'activity', username],
        queryFn: () => authApi.getUserActivity(username),
        staleTime: 1 * 60 * 1000,
        enabled: !!username,
    });
};

export const useOnlineUserCount = () => {
    return useQuery({
        queryKey: ['auth', 'online-count'],
        queryFn: () => authApi.getOnlineUserCount(),
        staleTime: 10 * 1000,
        refetchInterval: 30 * 1000, // Auto-refresh every 30s
    });
};

export const useOnlineUsers = () => {
    return useQuery({
        queryKey: ['auth', 'online-users'],
        queryFn: () => authApi.getOnlineUsers(),
        staleTime: 10 * 1000,
        refetchInterval: 30 * 1000,
    });
};

export const useLogoutAll = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (username: string) => authApi.logoutAll(username),
        onSuccess: (_, username) => {
            queryClient.invalidateQueries({ queryKey: ['auth', 'sessions', username] });
            toast.success('Logged out from all devices');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to logout from all devices');
        },
    });
};

// ==================== Market/Resale Hooks ====================

export const useResaleListings = (filters?: any) => {
    return useQuery({
        queryKey: ['market', 'resale', filters],
        queryFn: () => marketApi.getResaleListings(filters),
        staleTime: 1 * 60 * 1000,
    });
};

export const useCreateResale = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => marketApi.createResaleListing(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['market', 'resale'] });
            toast.success('Listing created successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create listing');
        },
    });
};

export const useBuyResale = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ listingId, buyerId }: { listingId: number; buyerId: number }) =>
            marketApi.buyResaleTicket(listingId, buyerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['market', 'resale'] });
            toast.success('Purchase successful');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Purchase failed');
        },
    });
};

export const useBundles = () => {
    return useQuery({
        queryKey: ['market', 'bundles'],
        queryFn: () => marketApi.getBundles(),
        staleTime: 5 * 60 * 1000,
    });
};

export const useBookBundle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ bundleId, userId }: { bundleId: number; userId: number }) =>
            marketApi.bookBundle(bundleId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast.success('Bundle booked successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to book bundle');
        },
    });
};

export const useLoyaltyPoints = (userId: number) => {
    return useQuery({
        queryKey: ['market', 'loyalty', userId],
        queryFn: () => marketApi.getLoyaltyPoints(userId),
        staleTime: 2 * 60 * 1000,
        enabled: !!userId,
    });
};

export const useLoyaltyHistory = (userId: number) => {
    return useQuery({
        queryKey: ['market', 'loyalty', userId, 'history'],
        queryFn: () => marketApi.getLoyaltyHistory(userId),
        staleTime: 5 * 60 * 1000,
        enabled: !!userId,
    });
};
