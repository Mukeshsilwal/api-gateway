/**
 * Hotel React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelApi } from '@/api/endpoints/hotel.api';
import type {
    HotelSearchRequest,
} from '@/api/types/hotel.types';
import toast from 'react-hot-toast';

// Query Keys
export const hotelKeys = {
    all: ['hotels'] as const,
    lists: () => [...hotelKeys.all, 'list'] as const,
    list: (filters: HotelSearchRequest) => [...hotelKeys.lists(), filters] as const,
    details: () => [...hotelKeys.all, 'detail'] as const,
    detail: (id: number) => [...hotelKeys.details(), id] as const,
    rooms: (hotelId: number) => [...hotelKeys.detail(hotelId), 'rooms'] as const,
};

// Queries
export const useHotelSearch = (searchParams: HotelSearchRequest) => {
    return useQuery({
        queryKey: hotelKeys.list(searchParams),
        queryFn: () => hotelApi.searchHotels(searchParams),
        staleTime: 3 * 60 * 1000,
        enabled: !!searchParams.city || !!searchParams.checkIn,
    });
};

export const useHotel = (hotelId: number) => {
    return useQuery({
        queryKey: hotelKeys.detail(hotelId),
        queryFn: () => hotelApi.getHotel(hotelId),
        staleTime: 5 * 60 * 1000,
        enabled: !!hotelId,
    });
};

export const useHotelRooms = (hotelId: number) => {
    return useQuery({
        queryKey: hotelKeys.rooms(hotelId),
        queryFn: () => hotelApi.getRooms(hotelId),
        staleTime: 2 * 60 * 1000,
        enabled: !!hotelId,
    });
};

// Mutations
export const useCheckAvailability = () => {
    return useMutation({
        mutationFn: (params: any) => hotelApi.checkAvailability(params),
        onError: (error: any) => {
            toast.error(error.message || 'Failed to check availability');
        },
    });
};

export const useCalculatePrice = () => {
    return useMutation({
        mutationFn: (params: any) => hotelApi.calculatePrice(params),
        onError: (error: any) => {
            toast.error(error.message || 'Failed to calculate price');
        },
    });
};

export const useLockRoom = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: any) => hotelApi.lockRoom(params),
        onSuccess: (data) => {
            toast.success('Room locked successfully');
            // Invalidate room availability
            queryClient.invalidateQueries({ queryKey: hotelKeys.rooms(data.hotelId) });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to lock room');
        },
    });
};

export const useCreateHotel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (hotelData: any) => hotelApi.createHotel(hotelData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hotelKeys.lists() });
            toast.success('Hotel created successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create hotel');
        },
    });
};

export const useUpdateHotel = (hotelId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (hotelData: any) => hotelApi.updateHotel(hotelId, hotelData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hotelKeys.detail(hotelId) });
            queryClient.invalidateQueries({ queryKey: hotelKeys.lists() });
            toast.success('Hotel updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update hotel');
        },
    });
};

export const useDeleteHotel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (hotelId: number) => hotelApi.deleteHotel(hotelId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hotelKeys.lists() });
            toast.success('Hotel deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete hotel');
        },
    });
};

export const useCreateRoom = (hotelId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (roomData: any) => hotelApi.createRoom(hotelId, roomData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hotelKeys.rooms(hotelId) });
            toast.success('Room created successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create room');
        },
    });
};

export const useUpdateRoom = (hotelId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roomId, roomData }: { roomId: number; roomData: any }) =>
            hotelApi.updateRoom(roomId, roomData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hotelKeys.rooms(hotelId) });
            toast.success('Room updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update room');
        },
    });
};

export const useDeleteRoom = (hotelId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (roomId: number) => hotelApi.deleteRoom(roomId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hotelKeys.rooms(hotelId) });
            toast.success('Room deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete room');
        },
    });
};

export const useHotelRecommendations = (userId?: number) => {
    return useQuery({
        queryKey: ['hotels', 'recommendations', userId],
        queryFn: () => hotelApi.getRecommendations(userId),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};
