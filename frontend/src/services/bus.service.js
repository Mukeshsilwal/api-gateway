import apiService from './api.service';
import API_CONFIG from '../config/api';

class BusService {
    /**
     * Search for buses based on source, destination and date
     * Uses BFF /api/bff/v1/buses/search endpoint with BusSearchRequest DTO
     * @param {Object} params - Search parameters
     * @param {string} params.source - Source city
     * @param {string} params.destination - Destination city
     * @param {string} params.date - Travel date (LocalDate format: YYYY-MM-DD)
     * @param {number} params.pageSize - Results per page (optional)
     * @param {number} params.cursor - Pagination cursor (optional)
     * @param {Object} options - Additional options
     * @param {AbortSignal} options.signal - AbortController signal for cancellation
     * @returns {Promise<Object>} Response<AggregatedBusSearchResults> with search results, route info, and seat availability
     */
    async searchBuses(params, options = {}) {
        const { source, destination, date, pageSize, cursor } = params;

        // Build BusSearchRequest DTO matching backend specification
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
    }

    /**
     * Get all available bus stops with route information
     * @returns {Promise<Array>} List of bus stops with routes
     */
    async getBusStopsWithRoutes() {
        return apiService.get(API_CONFIG.ENDPOINTS.GET_BUS_STOPS);
    }

    /**
     * Get all available bus stops/cities
     * @returns {Promise<Array>} List of bus stops
     */
    async getBusStops() {
        return apiService.get(API_CONFIG.ENDPOINTS.GET_BUS_STOPS);
    }

    /**
     * Get complete details for a specific bus
     * @param {string} busId - Bus ID
     * @returns {Promise<Object>} CompleteBusInfo
     */
    async getBusCompleteInfo(busId) {
        return apiService.get(`${API_CONFIG.BFF_PREFIX}/buses/${busId}/complete`);
    }

    /**
     * Get details for a specific bus (Legacy/Adapter)
     * @param {string} busId - Bus ID
     * @returns {Promise<Object>} Bus details
     */
    async getBusDetails(busId) {
        return this.getBusCompleteInfo(busId);
    }
}

export const busService = new BusService();
export default busService;
