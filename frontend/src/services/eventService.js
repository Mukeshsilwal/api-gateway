import apiClient, { API_ENDPOINTS } from '../config/apiConfig';

/**
 * Event API Service
 * Handles all event ticketing related API calls
 */
class EventService {
    /**
     * Get all events with pagination
     * @param {Object} params - { page, size, sort }
     * @returns {Promise} Response with events list
     */
    async getEvents(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.EVENTS.LIST, { params });
            return response.data;
        } catch (error) {
            console.error('Get events error:', error);
            throw error;
        }
    }

    /**
     * Search events
     * @param {Object} searchParams - { query, category, location, dateFrom, dateTo }
     * @returns {Promise} Response with search results
     */
    async searchEvents(searchParams) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.EVENTS.SEARCH, { params: searchParams });
            return response.data;
        } catch (error) {
            console.error('Search events error:', error);
            throw error;
        }
    }

    /**
     * Get event details
     * @param {string|number} eventId - Event ID
     * @returns {Promise} Response with event details
     */
    async getEventDetails(eventId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.EVENTS.DETAILS(eventId));
            return response.data;
        } catch (error) {
            console.error('Get event details error:', error);
            throw error;
        }
    }

    /**
     * Get event categories
     * @returns {Promise} Response with categories
     */
    async getCategories() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.EVENTS.CATEGORIES);
            return response.data;
        } catch (error) {
            console.error('Get categories error:', error);
            throw error;
        }
    }

    /**
     * Get featured events
     * @returns {Promise} Response with featured events
     */
    async getFeaturedEvents() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.EVENTS.FEATURED);
            return response.data;
        } catch (error) {
            console.error('Get featured events error:', error);
            throw error;
        }
    }

    /**
     * Get upcoming events
     * @returns {Promise} Response with upcoming events
     */
    async getUpcomingEvents() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.EVENTS.UPCOMING);
            return response.data;
        } catch (error) {
            console.error('Get upcoming events error:', error);
            throw error;
        }
    }

    /**
     * Get tickets for an event
     * @param {string|number} eventId - Event ID
     * @returns {Promise} Response with available tickets
     */
    async getEventTickets(eventId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.EVENTS.TICKETS(eventId));
            return response.data;
        } catch (error) {
            console.error('Get event tickets error:', error);
            throw error;
        }
    }

    /**
     * Create event booking
     * @param {Object} bookingData - Booking details
     * @returns {Promise} Response with booking confirmation
     */
    async createBooking(bookingData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.EVENTS.CREATE_BOOKING, bookingData);
            return response.data;
        } catch (error) {
            console.error('Create booking error:', error);
            throw error;
        }
    }

    /**
     * Get booking details
     * @param {string|number} bookingId - Booking ID
     * @returns {Promise} Response with booking details
     */
    async getBookingDetails(bookingId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.EVENTS.BOOKING_DETAILS(bookingId));
            return response.data;
        } catch (error) {
            console.error('Get booking details error:', error);
            throw error;
        }
    }

    // Admin Methods

    /**
     * Create new event (Admin)
     * @param {Object} eventData - Event details
     * @returns {Promise} Response with created event
     */
    async createEvent(eventData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.ADMIN.EVENTS.CREATE, eventData);
            return response.data;
        } catch (error) {
            console.error('Create event error:', error);
            throw error;
        }
    }

    /**
     * Update event (Admin)
     * @param {string|number} eventId - Event ID
     * @param {Object} eventData - Updated event details
     * @returns {Promise} Response with updated event
     */
    async updateEvent(eventId, eventData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.ADMIN.EVENTS.UPDATE(eventId), eventData);
            return response.data;
        } catch (error) {
            console.error('Update event error:', error);
            throw error;
        }
    }

    /**
     * Delete event (Admin)
     * @param {string|number} eventId - Event ID
     * @returns {Promise} Success response
     */
    async deleteEvent(eventId) {
        try {
            const response = await apiClient.delete(API_ENDPOINTS.EVENTS.DELETE(eventId));
            return response.data;
        } catch (error) {
            console.error('Delete event error:', error);
            throw error;
        }
    }

    /**
     * Get event bookings (Admin)
     * @param {string|number} eventId - Event ID
     * @returns {Promise} Response with bookings list
     */
    async getEventBookings(eventId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.EVENTS.BOOKINGS(eventId));
            return response.data;
        } catch (error) {
            console.error('Get event bookings error:', error);
            throw error;
        }
    }

    /**
     * Get all events with filters (Admin)
     * @param {Object} filters - { status, category, organizerId, dateFrom, dateTo, search }
     * @returns {Promise} Response with filtered events
     */
    async getAllEventsAdmin(filters = {}) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.ADMIN.EVENTS.SEARCH, filters);
            return response.data;
        } catch (error) {
            console.error('Get all events admin error:', error);
            throw error;
        }
    }

    /**
     * Approve event - publish it (Admin)
     * @param {string|number} eventId - Event ID
     * @returns {Promise} Response with updated event
     */
    async approveEvent(eventId) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.ADMIN.EVENTS.PUBLISH(eventId));
            return response.data;
        } catch (error) {
            console.error('Approve event error:', error);
            throw error;
        }
    }

    /**
     * Reject event - cancel with reason (Admin)
     * @param {string|number} eventId - Event ID
     * @param {string} reason - Rejection reason
     * @returns {Promise} Response with updated event
     */
    async rejectEvent(eventId, reason) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.ADMIN.EVENTS.CANCEL(eventId), {
                reason,
                cancelledBy: 'ADMIN'
            });
            return response.data;
        } catch (error) {
            console.error('Reject event error:', error);
            throw error;
        }
    }

    /**
     * Get event analytics (Admin)
     * @param {string|number} eventId - Event ID
     * @returns {Promise} Response with event analytics
     */
    async getEventAnalytics(eventId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.ADMIN.EVENTS.ANALYTICS(eventId));
            return response.data;
        } catch (error) {
            console.error('Get event analytics error:', error);
            throw error;
        }
    }

    /**
     * Get organizer's events (Admin)
     * @param {string|number} organizerId - Organizer ID
     * @param {string} status - Optional status filter
     * @returns {Promise} Response with organizer's events
     */
    async getOrganizerEvents(organizerId, status = null) {
        try {
            const url = API_ENDPOINTS.ADMIN.EVENTS.ORGANIZER_EVENTS(organizerId);
            const response = await apiClient.get(url, { params: { status } });
            return response.data;
        } catch (error) {
            console.error('Get organizer events error:', error);
            throw error;
        }
    }
}

export default new EventService();
