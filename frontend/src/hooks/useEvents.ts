/**
 * React Query Hooks for Event Management
 * Custom hooks for type-safe event operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import eventServices from '../services/event.service';
import type {
    OrganizerRegistrationDto,
    OrganizerProfileDto,
    OrganizerDashboardDto,
    EventCreationDto,
    EventDto,
    EventCardDto,
    EventAnalyticsDto,
    TicketBookingDto,
    EventBookingResponseDto,
    TicketTypeDto,
    PromoCodeDto,
    CheckInDto,
    EventAnnouncementDto,
} from '../types/event-dto';

// ============================================================
// QUERY KEYS
// ============================================================

export const eventQueryKeys = {
    // Organizers
    organizers: ['organizers'] as const,
    organizer: (id: number) => ['organizers', id] as const,
    organizerDashboard: (id: number) => ['organizers', id, 'dashboard'] as const,

    // Events
    events: ['events'] as const,
    event: (id: number) => ['events', id] as const,
    eventSearch: (params: any) => ['events', 'search', params] as const,
    organizerEvents: (organizerId: number, status?: string) =>
        ['organizers', organizerId, 'events', status] as const,
    featuredEvents: ['events', 'featured'] as const,

    // Analytics
    eventAnalytics: (eventId: number) => ['events', eventId, 'analytics'] as const,
    checkInStats: (eventId: number) => ['events', eventId, 'check-in-stats'] as const,

    // Bookings
    booking: (reference: string) => ['bookings', reference] as const,
};

// ============================================================
// ORGANIZER HOOKS
// ============================================================

export const useRegisterOrganizer = () => {
    return useMutation({
        mutationFn: (data: OrganizerRegistrationDto) =>
            eventServices.organizer.register(data),
    });
};

export const useOrganizerProfile = (organizerId: number, options?: UseQueryOptions<OrganizerProfileDto>) => {
    return useQuery({
        queryKey: eventQueryKeys.organizer(organizerId),
        queryFn: () => eventServices.organizer.getProfile(organizerId),
        enabled: !!organizerId,
        ...options,
    });
};

export const useUpdateOrganizerProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ organizerId, data }: { organizerId: number; data: Partial<OrganizerProfileDto> }) =>
            eventServices.organizer.updateProfile(organizerId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.organizer(variables.organizerId) });
        },
    });
};

export const useOrganizerDashboard = (organizerId: number, options?: UseQueryOptions<OrganizerDashboardDto>) => {
    return useQuery({
        queryKey: eventQueryKeys.organizerDashboard(organizerId),
        queryFn: () => eventServices.organizer.getDashboard(organizerId),
        enabled: !!organizerId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    });
};

// ============================================================
// EVENT HOOKS
// ============================================================

export const useCreateEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EventCreationDto) => eventServices.event.createEvent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.events });
        },
    });
};

export const useEvent = (eventId: number, options?: UseQueryOptions<EventDto>) => {
    return useQuery({
        queryKey: eventQueryKeys.event(eventId),
        queryFn: () => eventServices.event.getEvent(eventId),
        enabled: !!eventId,
        ...options,
    });
};

export const useUpdateEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, data }: { eventId: number; data: Partial<EventCreationDto> }) =>
            eventServices.event.updateEvent(eventId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.event(variables.eventId) });
        },
    });
};

export const usePublishEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventId: number) => eventServices.event.publishEvent(eventId),
        onSuccess: (_, eventId) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.event(eventId) });
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.events });
        },
    });
};

export const useCancelEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, reason }: { eventId: number; reason: string }) =>
            eventServices.event.cancelEvent(eventId, reason),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.event(variables.eventId) });
        },
    });
};

export const useOrganizerEvents = (
    organizerId: number,
    status?: string,
    options?: UseQueryOptions<EventDto[]>
) => {
    return useQuery({
        queryKey: eventQueryKeys.organizerEvents(organizerId, status),
        queryFn: () => eventServices.event.getOrganizerEvents(organizerId, status),
        enabled: !!organizerId,
        ...options,
    });
};

export const useSearchEvents = (
    params: any,
    options?: UseQueryOptions<EventCardDto[]>
) => {
    return useQuery({
        queryKey: eventQueryKeys.eventSearch(params),
        queryFn: () => eventServices.event.searchEvents(params),
        enabled: !!(params.query || params.category || params.city),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
};

export const useFeaturedEvents = (options?: UseQueryOptions<EventCardDto[]>) => {
    return useQuery({
        queryKey: eventQueryKeys.featuredEvents,
        queryFn: () => eventServices.event.getFeaturedEvents(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    });
};

// ============================================================
// TICKETING HOOKS
// ============================================================

export const useCreateTicketType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, data }: { eventId: number; data: TicketTypeDto }) =>
            eventServices.ticket.createTicketType(eventId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.event(variables.eventId) });
        },
    });
};

export const useBookTickets = () => {
    return useMutation({
        mutationFn: (data: TicketBookingDto) => eventServices.ticket.bookTickets(data),
    });
};

export const useBooking = (bookingReference: string, options?: UseQueryOptions<EventBookingResponseDto>) => {
    return useQuery({
        queryKey: eventQueryKeys.booking(bookingReference),
        queryFn: () => eventServices.ticket.getBooking(bookingReference),
        enabled: !!bookingReference,
        ...options,
    });
};

// ============================================================
// ANALYTICS HOOKS
// ============================================================

export const useEventAnalytics = (eventId: number, options?: UseQueryOptions<EventAnalyticsDto>) => {
    return useQuery({
        queryKey: eventQueryKeys.eventAnalytics(eventId),
        queryFn: () => eventServices.analytics.getEventAnalytics(eventId),
        enabled: !!eventId,
        refetchInterval: 30000, // Refresh every 30 seconds
        ...options,
    });
};

export const useCheckInStats = (eventId: number) => {
    return useQuery({
        queryKey: eventQueryKeys.checkInStats(eventId),
        queryFn: () => eventServices.checkIn.getCheckInStats(eventId),
        enabled: !!eventId,
        refetchInterval: 10000, // Refresh every 10 seconds
    });
};

// ============================================================
// PROMO CODE HOOKS
// ============================================================

export const useCreatePromoCode = () => {
    return useMutation({
        mutationFn: ({ eventId, data }: { eventId: number; data: PromoCodeDto }) =>
            eventServices.promoCode.createPromoCode(eventId, data),
    });
};

export const useValidatePromoCode = () => {
    return useMutation({
        mutationFn: ({ eventId, code }: { eventId: number; code: string }) =>
            eventServices.promoCode.validatePromoCode(eventId, code),
    });
};

// ============================================================
// CHECK-IN HOOKS
// ============================================================

export const useCheckIn = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CheckInDto) => eventServices.checkIn.checkIn(data),
        onSuccess: (response) => {
            // Invalidate check-in stats
            queryClient.invalidateQueries({ queryKey: ['events', 'check-in-stats'] });
        },
    });
};

// ============================================================
// COMMUNICATION HOOKS
// ============================================================

export const useSendAnnouncement = () => {
    return useMutation({
        mutationFn: (data: EventAnnouncementDto) =>
            eventServices.communication.sendAnnouncement(data),
    });
};

export const useSendReminder = () => {
    return useMutation({
        mutationFn: (eventId: number) =>
            eventServices.communication.sendReminder(eventId),
    });
};
