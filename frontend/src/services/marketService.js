import apiService from './api.service';
import API_CONFIG from '../config/api';

const marketService = {
    /**
     * Get live dashboard data for an event.
     * @param {string|number} eventId
     * @returns {Promise<object>}
     */
    getLiveDashboard: async (eventId) => {
        try {
            const response = await apiService.get(`${API_CONFIG.ENDPOINTS.MARKET_LIVE_DASHBOARD}${eventId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching market live dashboard:', error);
            throw error;
        }
    },

    /**
     * Get organizer dashboard data for an event.
     * @param {string|number} eventId
     * @returns {Promise<object>}
     */
    getOrganizerDashboard: async (eventId) => {
        try {
            const response = await apiService.get(`${API_CONFIG.ENDPOINTS.MARKET_ORGANIZER_DASHBOARD}${eventId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching market organizer dashboard:', error);
            throw error;
        }
    }
};

export default marketService;
