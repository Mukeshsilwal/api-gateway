import apiService from './api.service';
import API_CONFIG from '../config/api';

const ticketService = {
    /**
     * Create a ticket and email it.
     * @param {object} payload - { ticketDto, seatId, bookingId }
     * @returns {Promise<object>}
     */
    createTicketWithEmail: async (payload) => {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.TICKET_CREATE_WITH_EMAIL, payload);
            return response.data;
        } catch (error) {
            console.error('Error creating ticket with email:', error);
            throw error;
        }
    },

    /**
     * Get ticket aggregated details.
     * @param {string|number} ticketId
     * @returns {Promise<object>}
     */
    getTicketDetails: async (ticketId) => {
        try {
            const response = await apiService.get(`${API_CONFIG.ENDPOINTS.TICKET_DETAILS}${ticketId}/details`);
            return response.data;
        } catch (error) {
            console.error('Error fetching ticket details:', error);
            throw error;
        }
    }
};

export default ticketService;
