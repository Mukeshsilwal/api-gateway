import apiService from './api.service';
import API_CONFIG from '../config/api';

const adminService = {
    /**
     * Delete a bus and all its associated seats.
     * @param {string|number} busId
     * @returns {Promise<object>}
     */
    deleteBusWithSeats: async (busId) => {
        try {
            const response = await apiService.delete(`${API_CONFIG.ENDPOINTS.ADMIN_DELETE_BUS_WITH_SEATS}${busId}/with-seats`);
            return response.data;
        } catch (error) {
            console.error('Error deleting bus with seats:', error);
            throw error;
        }
    },

    /**
     * Create a route with source and destination stops.
     * @param {object} payload - { routeDto: { ... }, sourceStopId: 0, destinationStopId: 0 }
     * @returns {Promise<object>}
     */
    createRouteWithStops: async (payload) => {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.ADMIN_CREATE_ROUTE, payload);
            return response.data;
        } catch (error) {
            console.error('Error creating route with stops:', error);
            throw error;
        }
    }
};

export default adminService;
