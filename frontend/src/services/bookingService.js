import apiService from './api.service';
import API_CONFIG from '../config/api';

const bookingService = {
    /**
     * Complete a hotel booking with payment and user validation.
     * @param {object} payload - { bookingRequest, paymentRequest, userId, sessionId }
     * @returns {Promise<object>}
     */
    completeHotelBooking: async (payload) => {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.BOOKING_COMPLETE_HOTEL, payload);
            return response.data;
        } catch (error) {
            console.error('Error completing hotel booking:', error);
            throw error;
        }
    },

    /**
     * Initiate a booking for a specific category and service.
     * @param {string} category - e.g., 'HOTEL'
     * @param {string} service - e.g., 'ROOM'
     * @param {object} requestData - Booking Request Data
     * @returns {Promise<object>}
     */
    initiateBooking: async (category, service, requestData) => {
        try {
            // POST /api/bff/v1/bookings/{category}/{service}
            const url = `${API_CONFIG.ENDPOINTS.BOOKING_CREATE}/${category}/${service}`;
            const response = await apiService.post(url, requestData);
            return response.data;
        } catch (error) {
            console.error(`Error initiating booking for ${category}/${service}:`, error);
            throw error;
        }
    },

    /**
     * Get booking details by ID.
     * @param {string} bookingId
     * @returns {Promise<object>}
     */
    getBookingDetails: async (bookingId) => {
        try {
            const response = await apiService.get(`${API_CONFIG.ENDPOINTS.BOOKING_DETAILS}${bookingId}/details`);
            return response.data;
        } catch (error) {
            console.error('Error fetching booking details:', error);
            throw error;
        }
    },

    /**
     * Get booking history for the current user.
     * @param {number} page - Optional pagination
     * @param {number} size - Optional pagination
     * @returns {Promise<object>}
     */
    getBookingHistory: async (page = 0, size = 10, userId = null) => {
        try {
            const params = { page, size };
            if (userId) {
                params.userId = userId;
            }
            const response = await apiService.get(API_CONFIG.ENDPOINTS.BOOKING_HISTORY, {
                params
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching booking history:', error);
            throw error;
        }
    },

    /**
     * Get upcoming bookings for the current user.
     * @param {number} page
     * @param {number} size
     * @returns {Promise<object>}
     */
    getUpcomingBookings: async (page = 0, size = 10) => {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.BOOKING_UPCOMING, {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching upcoming bookings:', error);
            throw error;
        }
    },

    /**
     * Cancel a booking
     * @param {string} category 
     * @param {string} service 
     * @param {string} bookingId 
     * @returns {Promise<object>}
     */
    cancelBooking: async (category, service, bookingId) => {
        try {
            const url = `${API_CONFIG.ENDPOINTS.BOOKING_CANCEL}${category}/${service}/cancel`;
            const response = await apiService.post(url, { bookingId });
            return response.data;
        } catch (error) {
            console.error("Error cancelling booking", error);
            throw error;
        }
    },

    /**
     * Check room availability for a hotel
     * @param {Object} availabilityRequest - { hotelId, checkIn, checkOut, guestsCount, roomType? }
     * @returns {Promise<Object>} - Response containing list of available rooms
     */
    checkAvailability: async (availabilityRequest) => {
        try {
            const response = await apiService.post('/api/bff/v1/hotels/bookings/availability', availabilityRequest);
            return response.data;
        } catch (error) {
            console.error('Error checking availability:', error);
            throw error;
        }
    },

    /**
     * Calculate price for a booking
     * @param {Object} pricingRequest - { roomId, rentTypeId, mealPlanId, checkIn, checkOut }
     * @returns {Promise<Object>} - Pricing breakdown
     */
    calculatePrice: async (pricingRequest) => {
        try {
            const response = await apiService.post('/api/bff/v1/hotels/bookings/price', pricingRequest);
            return response.data;
        } catch (error) {
            console.error('Error calculating price:', error);
            throw error;
        }
    },

    /**
     * Lock a room (Initiate Booking)
     * @param {Object} bookingRequest - Full booking details
     * @returns {Promise<Object>} - Booking response with reference
     */
    lockRoom: async (bookingRequest) => {
        try {
            const response = await apiService.post('/api/bff/v1/hotels/bookings/lock', bookingRequest);
            return response.data;
        } catch (error) {
            console.error('Error locking room:', error);
            throw error;
        }
    },

    /**
     * Confirm a booking (Post-Payment)
     * @param {string} reference - Booking reference
     * @returns {Promise<Object>}
     */
    confirmBooking: async (reference) => {
        try {
            const response = await apiService.post(`/api/bff/v1/hotels/bookings/${reference}/confirm`);
            return response.data;
        } catch (error) {
            console.error('Error confirming booking:', error);
            throw error;
        }
    }
};

export default bookingService;
