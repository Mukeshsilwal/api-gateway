import apiService from './api.service';
import API_CONFIG from '../config/api';

/**
 * Room Maintenance Service
 * Handles all room maintenance operations matching backend API
 */
const roomMaintenanceService = {
    /**
     * Create or update room maintenance record
     * POST /maintenance/save
     * @param {Object} maintenanceData - Maintenance data
     * @param {number} maintenanceData.roomId - Room ID (required)
     * @param {string} maintenanceData.roomStatus - Room status
     * @param {string} maintenanceData.cleaningStatus - Cleaning status
     * @param {string} maintenanceData.maintenanceStatus - Maintenance status
     * @param {Object} maintenanceData.amenitiesStatus - Map of amenity statuses
     * @param {Array} maintenanceData.suggestions - List of suggestions
     * @param {string} maintenanceData.assignedStaff - Assigned staff name
     * @returns {Promise<Object>} Maintenance response
     */
    async saveMaintenanceRecord(maintenanceData) {
        try {
            if (!maintenanceData.roomId) {
                throw new Error('Room ID is required');
            }

            const response = await apiService.post(API_CONFIG.ENDPOINTS.MAINTENANCE_SAVE, {
                roomId: maintenanceData.roomId,
                roomStatus: maintenanceData.roomStatus || null,
                cleaningStatus: maintenanceData.cleaningStatus || null,
                maintenanceStatus: maintenanceData.maintenanceStatus || null,
                amenitiesStatus: maintenanceData.amenitiesStatus || {},
                suggestions: maintenanceData.suggestions || [],
                assignedStaff: maintenanceData.assignedStaff || null
            });

            return response.data || response;
        } catch (error) {
            console.error('Error saving maintenance record:', error);

            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.message) {
                throw error;
            } else {
                throw new Error('Failed to save maintenance record');
            }
        }
    },

    /**
     * Assign staff to a maintenance record
     * POST /maintenance/assign/{maintenanceId}
     * @param {number} maintenanceId - Maintenance record ID
     * @param {string} staffName - Staff name to assign
     * @returns {Promise<Object>} Updated maintenance response
     */
    async assignStaffToMaintenance(maintenanceId, staffName) {
        try {
            if (!maintenanceId) {
                throw new Error('Maintenance ID is required');
            }

            if (!staffName) {
                throw new Error('Staff name is required');
            }

            const response = await apiService.post(
                `${API_CONFIG.ENDPOINTS.MAINTENANCE_ASSIGN}${maintenanceId}?staffName=${encodeURIComponent(staffName)}`
            );

            return response.data || response;
        } catch (error) {
            console.error('Error assigning staff to maintenance:', error);

            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.message) {
                throw error;
            } else {
                throw new Error('Failed to assign staff');
            }
        }
    },

    /**
     * Get maintenance record by room ID
     * GET /maintenance/room/{roomId}
     * @param {number} roomId - Room ID
     * @returns {Promise<Object>} Maintenance record
     */
    async getMaintenanceByRoomId(roomId) {
        try {
            if (!roomId) {
                throw new Error('Room ID is required');
            }

            const response = await apiService.get(`${API_CONFIG.ENDPOINTS.MAINTENANCE_GET_BY_ROOM}${roomId}`);
            return response.data || response;
        } catch (error) {
            // If maintenance record doesn't exist, return null instead of throwing
            if (error.response?.status === 404) {
                console.log(`No maintenance record found for room ${roomId}`);
                return null;
            }

            console.error('Error fetching maintenance record:', error);

            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.message) {
                throw error;
            } else {
                throw new Error('Failed to fetch maintenance record');
            }
        }
    },

    /**
     * Legacy method for backward compatibility
     * @deprecated Use saveMaintenanceRecord instead
     */
    async updateRoomMaintenance(roomId, maintenanceData) {
        return this.saveMaintenanceRecord({
            roomId,
            ...maintenanceData
        });
    },

    /**
     * Legacy method for backward compatibility  
     * @deprecated Use assignStaffToMaintenance instead
     */
    async assignStaff(roomId, staffType) {
        console.warn('assignStaff is deprecated. Use assignStaffToMaintenance with maintenance ID instead.');
        // This would need the maintenance record ID, so we'd need to fetch it first
        throw new Error('Please use assignStaffToMaintenance with maintenance record ID');
    }
};

export default roomMaintenanceService;
