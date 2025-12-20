/**
 * Enhanced API Service with TypeScript DTO Support
 * Type-safe API calls using DTO definitions
 */

import api from './api.service';
import type {
    // User & Auth
    UserDto,
    AdminRegistrationRequestDto,

    // Bus
    BusDto,
    SeatDto,
    BookingRequestDto,
    BookingTicketDto,

    // Hotel
    HotelDto,
    AvailableRoomDto,
    AvailabilityRequestDto,
    PricingRequestDto,
    PricingResponseDto,
    HotelBookingRequestDto,
    BookingResponseDto,

    // Payment
    PaymentRequestDto,
    PaymentResponseDto,

    // AI
    ChatRequest,
    ChatResponse,

    // Aggregated
    AggregatedHotelDetails,
    AggregatedSearchResults,
    AggregatedUserDashboard,
    HomePageData,
    DashboardSummaryDto,

    // Common
    Response,
    PageRequest,
    PageResponse,
} from '../types/dto';

// ============================================================
// USER MANAGEMENT
// ============================================================

export const userService = {
    /**
     * Get all users with optional role filter
     */
    async getAllUsers(role?: string): Promise<UserDto[]> {
        const url = role ? `/api/bff/v1/users?role=${role}` : '/api/bff/v1/users';
        return api.get<UserDto[]>(url);
    },

    /**
     * Get user by ID
     */
    async getUserById(id: number): Promise<UserDto> {
        return api.get<UserDto>(`/api/bff/v1/users/${id}`);
    },

    /**
     * Delete user
     */
    async deleteUser(id: number): Promise<void> {
        return api.delete(`/api/bff/v1/users/${id}`);
    },
};

// ============================================================
// BUS BOOKING
// ============================================================

export const busService = {
    /**
     * Search buses
     */
    async searchBuses(params: {
        origin: string;
        destination: string;
        date: string;
    }): Promise<BusDto[]> {
        return api.post<BusDto[]>('/api/bff/v1/buses/search', params);
    },

    /**
     * Get bus details with seats
     */
    async getBusDetails(busId: number): Promise<BusDto> {
        return api.get<BusDto>(`/api/bff/v1/buses/${busId}`);
    },

    /**
     * Get available seats
     */
    async getAvailableSeats(busId: number): Promise<SeatDto[]> {
        return api.get<SeatDto[]>(`/api/bff/v1/buses/${busId}/seats`);
    },

    /**
     * Hold seats
     */
    async holdSeats(busId: number, seatIds: number[]): Promise<void> {
        return api.post('/api/bff/v1/buses/seats/hold', { busId, seatIds });
    },

    /**
     * Create booking
     */
    async createBooking(request: BookingRequestDto): Promise<BookingTicketDto> {
        return api.post<BookingTicketDto>('/api/bff/v1/bookings/bus', request);
    },
};

// ============================================================
// HOTEL BOOKING
// ============================================================

export const hotelService = {
    /**
     * Search hotels
     */
    async searchHotels(params: {
        city?: string;
        checkIn?: string;
        checkOut?: string;
        guests?: number;
    }): Promise<HotelDto[]> {
        return api.post<HotelDto[]>('/api/bff/v1/hotels/search', params);
    },

    /**
     * Get hotel details with rooms
     */
    async getHotelDetails(hotelId: number): Promise<AggregatedHotelDetails> {
        return api.get<AggregatedHotelDetails>(`/api/bff/v1/hotels/${hotelId}`);
    },

    /**
     * Check room availability
     */
    async checkAvailability(request: AvailabilityRequestDto): Promise<AvailableRoomDto[]> {
        return api.post<AvailableRoomDto[]>('/api/bff/v1/hotels/availability', request);
    },

    /**
     * Get pricing for room
     */
    async getPricing(request: PricingRequestDto): Promise<PricingResponseDto> {
        return api.post<PricingResponseDto>('/api/bff/v1/hotels/pricing', request);
    },

    /**
     * Create hotel booking
     */
    async createBooking(request: HotelBookingRequestDto): Promise<BookingResponseDto> {
        return api.post<BookingResponseDto>('/api/bff/v1/hotels/book', request);
    },
};

// ============================================================
// PAYMENT
// ============================================================

export const paymentService = {
    /**
     * Initiate payment
     */
    async initiatePayment(request: PaymentRequestDto): Promise<PaymentResponseDto> {
        return api.post<PaymentResponseDto>('/api/bff/v1/payments/initiate', request);
    },

    /**
     * Verify payment
     */
    async verifyPayment(transactionId: string): Promise<PaymentResponseDto> {
        return api.get<PaymentResponseDto>(`/api/bff/v1/payments/verify/${transactionId}`);
    },
};

// ============================================================
// AI CHATBOT
// ============================================================

export const chatbotService = {
    /**
     * Send message to AI chatbot
     */
    async sendMessage(message: string): Promise<ChatResponse> {
        return api.post<ChatResponse>('/api/bff/v1/ai/chat', { message });
    },

    /**
     * Clear conversation history
     */
    async clearConversation(): Promise<void> {
        return api.delete('/api/bff/v1/ai/chat/conversation');
    },
};

// ============================================================
// DASHBOARD & AGGREGATED DATA
// ============================================================

export const dashboardService = {
    /**
     * Get home page data
     */
    async getHomePageData(): Promise<HomePageData> {
        return api.get<HomePageData>('/api/bff/v1/home');
    },

    /**
     * Get user dashboard
     */
    async getUserDashboard(): Promise<AggregatedUserDashboard> {
        return api.get<AggregatedUserDashboard>('/api/bff/v1/dashboard/user');
    },

    /**
     * Get admin dashboard summary
     */
    async getAdminDashboard(): Promise<DashboardSummaryDto> {
        return api.get<DashboardSummaryDto>('/api/bff/v1/admin/dashboard');
    },

    /**
     * Unified search across hotels and buses
     */
    async unifiedSearch(query: string): Promise<AggregatedSearchResults> {
        return api.post<AggregatedSearchResults>('/api/bff/v1/search', { query });
    },
};

// ============================================================
// EXPORT ALL SERVICES
// ============================================================

export default {
    user: userService,
    bus: busService,
    hotel: hotelService,
    payment: paymentService,
    chatbot: chatbotService,
    dashboard: dashboardService,
};
