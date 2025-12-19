import apiService from './api.service';
import API_CONFIG from '../config/api';

const busService = {
    /**
     * Get complete details for a bus (details, route, stops, seats).
     * @param {string|number} busId
     * @returns {Promise<object>}
     */
    getBusCompleteDetails: async (busId) => {
        try {
            const response = await apiService.get(`${API_CONFIG.ENDPOINTS.BUS_COMPLETE_DETAILS}/${busId}/complete`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bus complete details:', error);
            throw error;
        }
    },

    /**
     * Get bus dashboard statistics.
     * @returns {Promise<object>}
     */
    getBusDashboard: async () => {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.BUS_DASHBOARD);
            return response.data;
        } catch (error) {
            console.error('Error fetching bus dashboard:', error);
            throw error;
        }
    },

    /**
     * Search for buses based on source, destination and date
     * @param {Object} params - Search parameters
     * @param {Object} options - Additional options
     * @returns {Promise<Object>}
     */
    searchBuses: async (params, options = {}) => {
        const { source, destination, date, pageSize, cursor } = params;
        const requestBody = {
            source,
            destination,
            date,
            ...(pageSize && { pageSize }),
            ...(cursor && { cursor })
        };
        return apiService.post(
            API_CONFIG.ENDPOINTS.SEARCH_BUSES,
            requestBody,
            { signal: options.signal }
        );
    },

    /**
     * Get all available bus stops/cities
     * @returns {Promise<Array>}
     */
    getBusStops: async () => {
        return apiService.get(API_CONFIG.ENDPOINTS.GET_BUS_STOPS);
    },

    /**
     * Get all available bus stops with route information (Alias)
     * @returns {Promise<Array>}
     */
    getBusStopsWithRoutes: async () => {
        return apiService.get(API_CONFIG.ENDPOINTS.GET_BUS_STOPS);
    }
};

export default busService;
