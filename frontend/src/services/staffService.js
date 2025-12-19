import apiService from './api.service';
import API_CONFIG from '../config/api';

const staffService = {
    /**
     * Create a new staff member.
     * @param {object} staffData - { fullName, staffType, phone, hotelId, notes }
     * @returns {Promise<object>}
     */
    createStaff: async (staffData) => {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.STAFF_CREATE, staffData);
            return response.data;
        } catch (error) {
            console.error('Error creating staff:', error);
            throw error;
        }
    }
};

export default staffService;
