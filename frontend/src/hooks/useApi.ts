/**
 * React Query Hooks for Type-Safe Data Fetching
 * Custom hooks using DTO types for all API calls
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import bffService from '../services/bff.service';
import type {
    UserDto,
    BusDto,
    HotelDto,
    SeatDto,
    BookingRequestDto,
    BookingTicketDto,
    HotelBookingRequestDto,
    BookingResponseDto,
    PaymentRequestDto,
    PaymentResponseDto,
    ChatResponse,
    AggregatedHotelDetails,
    HomePageData,
    DashboardSummaryDto,
} from '../types/dto';

// ============================================================
// QUERY KEYS
// ============================================================

export const queryKeys = {
    // Users
    users: ['users'] as const,
    usersByRole: (role: string) => ['users', role] as const,
    user: (id: number) => ['users', id] as const,

    // Buses
    buses: ['buses'] as const,
    busSearch: (params: any) => ['buses', 'search', params] as const,
    bus: (id: number) => ['buses', id] as const,
    busSeats: (busId: number) => ['buses', busId, 'seats'] as const,

    // Hotels
    hotels: ['hotels'] as const,
    hotelSearch: (params: any) => ['hotels', 'search', params] as const,
    hotel: (id: number) => ['hotels', id] as const,
    hotelAvailability: (hotelId: number, params: any) => ['hotels', hotelId, 'availability', params] as const,

    // Dashboard
    homePage: ['home'] as const,
    userDashboard: ['dashboard', 'user'] as const,
    adminDashboard: ['dashboard', 'admin'] as const,
};

// ============================================================
// USER HOOKS
// ============================================================

export const useUsers = (role?: string, options?: UseQueryOptions<UserDto[]>) => {
    return useQuery({
        queryKey: role ? queryKeys.usersByRole(role) : queryKeys.users,
        queryFn: () => bffService.user.getAllUsers(role),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
};

export const useUser = (id: number, options?: UseQueryOptions<UserDto>) => {
    return useQuery({
        queryKey: queryKeys.user(id),
        queryFn: () => bffService.user.getUserById(id),
        enabled: !!id,
        ...options,
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => bffService.user.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users });
        },
    });
};

// ============================================================
// BUS HOOKS
// ============================================================

export const useBusSearch = (
    params: { origin: string; destination: string; date: string },
    options?: UseQueryOptions<BusDto[]>
) => {
    return useQuery({
        queryKey: queryKeys.busSearch(params),
        queryFn: () => bffService.bus.searchBuses(params),
        enabled: !!(params.origin && params.destination && params.date),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    });
};

export const useBusDetails = (busId: number, options?: UseQueryOptions<BusDto>) => {
    return useQuery({
        queryKey: queryKeys.bus(busId),
        queryFn: () => bffService.bus.getBusDetails(busId),
        enabled: !!busId,
        ...options,
    });
};

export const useBusSeats = (busId: number, options?: UseQueryOptions<SeatDto[]>) => {
    return useQuery({
        queryKey: queryKeys.busSeats(busId),
        queryFn: () => bffService.bus.getAvailableSeats(busId),
        enabled: !!busId,
        refetchInterval: 30000, // Refresh every 30 seconds for real-time availability
        ...options,
    });
};

export const useHoldSeats = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ busId, seatIds }: { busId: number; seatIds: number[] }) =>
            bffService.bus.holdSeats(busId, seatIds),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.busSeats(variables.busId) });
        },
    });
};

export const useCreateBusBooking = () => {
    return useMutation({
        mutationFn: (request: BookingRequestDto) => bffService.bus.createBooking(request),
    });
};

// ============================================================
// HOTEL HOOKS
// ============================================================

export const useHotelSearch = (
    params: { city?: string; checkIn?: string; checkOut?: string; guests?: number },
    options?: UseQueryOptions<HotelDto[]>
) => {
    return useQuery({
        queryKey: queryKeys.hotelSearch(params),
        queryFn: () => bffService.hotel.searchHotels(params),
        enabled: !!params.city,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
};

export const useHotelDetails = (hotelId: number, options?: UseQueryOptions<AggregatedHotelDetails>) => {
    return useQuery({
        queryKey: queryKeys.hotel(hotelId),
        queryFn: () => bffService.hotel.getHotelDetails(hotelId),
        enabled: !!hotelId,
        ...options,
    });
};

export const useCreateHotelBooking = () => {
    return useMutation({
        mutationFn: (request: HotelBookingRequestDto) => bffService.hotel.createBooking(request),
    });
};

// ============================================================
// PAYMENT HOOKS
// ============================================================

export const useInitiatePayment = () => {
    return useMutation({
        mutationFn: (request: PaymentRequestDto) => bffService.payment.initiatePayment(request),
    });
};

export const useVerifyPayment = (transactionId: string, options?: UseQueryOptions<PaymentResponseDto>) => {
    return useQuery({
        queryKey: ['payment', transactionId],
        queryFn: () => bffService.payment.verifyPayment(transactionId),
        enabled: !!transactionId,
        refetchInterval: 5000, // Poll every 5 seconds
        ...options,
    });
};

// ============================================================
// CHATBOT HOOKS
// ============================================================

export const useSendMessage = () => {
    return useMutation({
        mutationFn: (message: string) => bffService.chatbot.sendMessage(message),
    });
};

export const useClearConversation = () => {
    return useMutation({
        mutationFn: () => bffService.chatbot.clearConversation(),
    });
};

// ============================================================
// DASHBOARD HOOKS
// ============================================================

export const useHomePageData = (options?: UseQueryOptions<HomePageData>) => {
    return useQuery({
        queryKey: queryKeys.homePage,
        queryFn: () => bffService.dashboard.getHomePageData(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    });
};

export const useUserDashboard = (options?: UseQueryOptions<any>) => {
    return useQuery({
        queryKey: queryKeys.userDashboard,
        queryFn: () => bffService.dashboard.getUserDashboard(),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

export const useAdminDashboard = (options?: UseQueryOptions<DashboardSummaryDto>) => {
    return useQuery({
        queryKey: queryKeys.adminDashboard,
        queryFn: () => bffService.dashboard.getAdminDashboard(),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    });
};

// ============================================================
// UTILITY HOOKS
// ============================================================

/**
 * Hook for optimistic updates
 */
export const useOptimisticUpdate = <T,>(queryKey: any[]) => {
    const queryClient = useQueryClient();

    const setOptimisticData = (updater: (old: T | undefined) => T) => {
        queryClient.setQueryData(queryKey, updater);
    };

    const rollback = (previousData: T) => {
        queryClient.setQueryData(queryKey, previousData);
    };

    return { setOptimisticData, rollback };
};

/**
 * Hook for prefetching data
 */
export const usePrefetch = () => {
    const queryClient = useQueryClient();

    const prefetchHotel = (hotelId: number) => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.hotel(hotelId),
            queryFn: () => bffService.hotel.getHotelDetails(hotelId),
        });
    };

    const prefetchBus = (busId: number) => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.bus(busId),
            queryFn: () => bffService.bus.getBusDetails(busId),
        });
    };

    return { prefetchHotel, prefetchBus };
};
