import apiService from './api.service';
import API_CONFIG from '../config/api';

const bookingSeatService = {
    /**
     * Complete a seat booking.
     * @param {object} payload - { seatId, bookingRequest, bookingTicket, ticketDto }
     * @returns {Promise<object>}
     */
    completeSeatBooking: async (payload) => {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.SEAT_BOOKING_COMPLETE, payload);
            return response.data;
        } catch (error) {
            console.error('Error completing seat booking:', error);
            throw error;
        }
    },

    /**
     * Get seat booking aggregated details.
     * @param {string} bookingId
     * @returns {Promise<object>}
     */
    getSeatBookingDetails: async (bookingId) => {
        try {
            const response = await apiService.get(`${API_CONFIG.ENDPOINTS.SEAT_BOOKING_DETAILS}${bookingId}/details`);
            return response.data;
        } catch (error) {
            console.error('Error fetching seat booking details:', error);
            throw error;
        }
    }
};

export default bookingSeatService;
