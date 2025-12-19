import apiService from './api.service';
import API_CONFIG from '../config/api';

const mainService = {
    /**
     * Get Home Page Data (Featured, Recommendations, Nearby, etc.)
     * @returns {Promise<object>}
     */
    getHomeData: async () => {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.HOME_DATA);
            return response.data;
        } catch (error) {
            console.error('Error fetching home data:', error);
            throw error;
        }
    }
};

export default mainService;
