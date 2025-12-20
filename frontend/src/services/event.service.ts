/**
 * Event Service API Client
 * Type-safe client for event management operations
 */

import apiClient from './api.service'; // Changed 'api' to 'apiClient'
import type {
    // Organizer
    OrganizerRegistrationDto,
    OrganizerProfileDto,
    OrganizerDashboardDto,

    // Event
    EventCreationDto,
    EventDto,
    EventCardDto,
    EventAnalyticsDto,

    // Ticketing
    TicketBookingDto,
    EventBookingResponseDto,
    TicketTypeDto,
    PromoCodeDto,

    // Check-in
    CheckInDto,
    CheckInResponseDto,

    // Communication
    EventAnnouncementDto,

    // Common
    Response,
} from '../types/event-dto';

// ============================================================
// ORGANIZER MANAGEMENT
// ============================================================

export const organizerService = {
    /**
     * Register new organizer
     */
    async register(data: OrganizerRegistrationDto): Promise<OrganizerProfileDto> {
        return api.post<OrganizerProfileDto>('/api/bff/v1/organizers/register', data);
    },

    /**
     * Get organizer profile
     */
    async getProfile(organizerId: number): Promise<OrganizerProfileDto> {
        return api.get<OrganizerProfileDto>(`/api/bff/v1/organizers/${organizerId}`);
    },

    /**
     * Update organizer profile
     */
    async updateProfile(organizerId: number, data: Partial<OrganizerProfileDto>): Promise<OrganizerProfileDto> {
        return api.put<OrganizerProfileDto>(`/api/bff/v1/organizers/${organizerId}`, data);
    },

    /**
     * Get organizer dashboard
     */
    async getDashboard(organizerId: number): Promise<OrganizerDashboardDto> {
        return api.get<OrganizerDashboardDto>(`/api/bff/v1/organizers/${organizerId}/dashboard`);
    },

    /**
     * Upload organizer logo
     */
    async uploadLogo(organizerId: number, file: File): Promise<string> {
        const formData = new FormData();
        formData.append('logo', file);
        return api.post<string>(`/api/bff/v1/organizers/${organizerId}/logo`, formData);
    },
};

// ============================================================
// EVENT MANAGEMENT
// ============================================================

export const eventService = {
    /**
     * Create new event
     */
    async createEvent(data: EventCreationDto): Promise<EventDto> {
        return api.post<EventDto>('/api/bff/v1/events', data);
    },

    /**
     * Get event by ID
     */
    async getEvent(eventId: number): Promise<EventDto> {
        return api.get<EventDto>(`/api/bff/v1/events/${eventId}`);
    },

    /**
     * Update event
     */
    async updateEvent(eventId: number, data: Partial<EventCreationDto>): Promise<EventDto> {
        return api.put<EventDto>(`/api/bff/v1/events/${eventId}`, data);
    },

    /**
     * Delete event
     */
    async deleteEvent(eventId: number): Promise<void> {
        return api.delete(`/api/bff/v1/events/${eventId}`);
    },

    /**
     * Publish event
     */
    async publishEvent(eventId: number): Promise<EventDto> {
        return api.post<EventDto>(`/api/bff/v1/events/${eventId}/publish`);
    },

    /**
     * Cancel event
     */
    async cancelEvent(eventId: number, reason: string): Promise<EventDto> {
        return api.post<EventDto>(`/api/bff/v1/events/${eventId}/cancel`, { reason });
    },

    /**
     * Get organizer's events
     */
    async getOrganizerEvents(organizerId: number, status?: string): Promise<EventDto[]> {
        const url = status
            ? `/api/bff/v1/organizers/${organizerId}/events?status=${status}`
            : `/api/bff/v1/organizers/${organizerId}/events`;
        return api.get<EventDto[]>(url);
    },

    /**
     * Search events
     */
    async searchEvents(params: {
        query?: string;
        category?: string;
        type?: string;
        city?: string;
        startDate?: string;
        endDate?: string;
        minPrice?: number;
        maxPrice?: number;
    }): Promise<EventCardDto[]> {
        return api.post<EventCardDto[]>('/api/bff/v1/events/search', params);
    },

    /**
     * Get featured events
     */
    async getFeaturedEvents(): Promise<EventCardDto[]> {
        return api.get<EventCardDto[]>('/api/bff/v1/events/featured');
    },

    /**
     * Upload event images
     */
    async uploadImages(eventId: number, files: File[]): Promise<string[]> {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        return api.post<string[]>(`/api/bff/v1/events/${eventId}/images`, formData);
    },
};

// ============================================================
// TICKETING
// ============================================================

export const ticketService = {
    /**
     * Create ticket type
     */
    async createTicketType(eventId: number, data: TicketTypeDto): Promise<TicketTypeDto> {
        return api.post<TicketTypeDto>(`/api/bff/v1/events/${eventId}/tickets`, data);
    },

    /**
     * Update ticket type
     */
    async updateTicketType(eventId: number, ticketTypeId: number, data: Partial<TicketTypeDto>): Promise<TicketTypeDto> {
        return api.put<TicketTypeDto>(`/api/bff/v1/events/${eventId}/tickets/${ticketTypeId}`, data);
    },

    /**
     * Delete ticket type
     */
    async deleteTicketType(eventId: number, ticketTypeId: number): Promise<void> {
        return api.delete(`/api/bff/v1/events/${eventId}/tickets/${ticketTypeId}`);
    },

    /**
     * Book tickets
     */
    async bookTickets(data: TicketBookingDto): Promise<EventBookingResponseDto> {
        return api.post<EventBookingResponseDto>('/api/bff/v1/bookings/event', data);
    },

    /**
     * Get booking details
     */
    async getBooking(bookingReference: string): Promise<EventBookingResponseDto> {
        return api.get<EventBookingResponseDto>(`/api/bff/v1/bookings/event/${bookingReference}`);
    },

    /**
     * Cancel booking
     */
    async cancelBooking(bookingReference: string, reason: string): Promise<void> {
        return api.post(`/api/bff/v1/bookings/event/${bookingReference}/cancel`, { reason });
    },
};

// ============================================================
// ANALYTICS
// ============================================================

export const analyticsService = {
    /**
     * Get event analytics
     */
    async getEventAnalytics(eventId: number): Promise<EventAnalyticsDto> {
        return api.get<EventAnalyticsDto>(`/api/bff/v1/events/${eventId}/analytics`);
    },

    /**
     * Export attendee list
     */
    async exportAttendees(eventId: number, format: 'CSV' | 'EXCEL'): Promise<Blob> {
        return api.get(`/api/bff/v1/events/${eventId}/attendees/export?format=${format}`, {
            responseType: 'blob',
        });
    },
};

// ============================================================
// PROMO CODES
// ============================================================

export const promoCodeService = {
    /**
     * Create promo code
     */
    async createPromoCode(eventId: number, data: PromoCodeDto): Promise<PromoCodeDto> {
        return api.post<PromoCodeDto>(`/api/bff/v1/events/${eventId}/promo-codes`, data);
    },

    /**
     * Validate promo code
     */
    async validatePromoCode(eventId: number, code: string): Promise<PromoCodeDto> {
        return api.get<PromoCodeDto>(`/api/bff/v1/events/${eventId}/promo-codes/${code}/validate`);
    },
};

// ============================================================
// CHECK-IN
// ============================================================

export const checkInService = {
    /**
     * Check in attendee
     */
    async checkIn(data: CheckInDto): Promise<CheckInResponseDto> {
        return api.post<CheckInResponseDto>('/api/bff/v1/check-in', data);
    },

    /**
     * Get check-in stats
     */
    async getCheckInStats(eventId: number): Promise<{
        totalTickets: number;
        checkedIn: number;
        pending: number;
        checkInRate: number;
    }> {
        return api.get(`/api/bff/v1/events/${eventId}/check-in/stats`);
    },
};

// ============================================================
// COMMUNICATION
// ============================================================

export const communicationService = {
    /**
     * Send event announcement
     */
    async sendAnnouncement(data: EventAnnouncementDto): Promise<void> {
        return api.post('/api/bff/v1/events/announcements', data);
    },

    /**
     * Send event reminder
     */
    async sendReminder(eventId: number): Promise<void> {
        return api.post(`/api/bff/v1/events/${eventId}/reminders`);
    },
};

// ============================================================
// EXPORT ALL SERVICES
// ============================================================

export default {
    organizer: organizerService,
    event: eventService,
    ticket: ticketService,
    analytics: analyticsService,
    promoCode: promoCodeService,
    checkIn: checkInService,
    communication: communicationService,
};
