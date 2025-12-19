import apiService from './api.service';
import API_CONFIG from '../config/api';

class HomeService {
    /**
     * Get aggregated home page data
     * @returns {Promise<Object>} CompleteHomePageData
     */
    async getHomeData() {
        try {
            const data = await apiService.get(API_CONFIG.ENDPOINTS.HOME);
            return data;
        } catch (error) {
            console.error('Failed to fetch home data:', error);
            throw error;
        }
    }

    /**
     * Get complete profile data
     * @returns {Promise<Object>} Complete profile info
     */
    async getCompleteProfile() {
        try {
            return await apiService.get(API_CONFIG.ENDPOINTS.PROFILE_COMPLETE);
        } catch (error) {
            console.error('Failed to fetch complete profile:', error);
            throw error;
        }
    }
}

export const homeService = new HomeService();
export default homeService;
