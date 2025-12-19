import apiService from './api.service';
import API_CONFIG from '../config/api';

const maintenanceService = {
    /**
     * Save a maintenance record for a room.
     * @param {object} maintenanceData - { roomId, roomStatus, cleaningStatus, maintenanceStatus, amenitiesStatus, suggestions, assignedStaff }
     * @returns {Promise<object>}
     */
    saveMaintenanceRecord: async (maintenanceData) => {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.MAINTENANCE_SAVE, maintenanceData);
            return response.data;
        } catch (error) {
            console.error('Error saving maintenance record:', error);
            throw error;
        }
    }
};

export default maintenanceService;
