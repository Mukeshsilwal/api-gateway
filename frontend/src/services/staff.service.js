import apiService from './api.service';
import API_CONFIG from '../config/api';

/**
 * Staff Management Service
 * Handles all staff-related operations for hotel maintenance
 */
const staffService = {
    /**
     * Get all staff for a specific hotel
     * @param {string|number} hotelId - Hotel ID
     * @param {Object} options - Query options
     * @param {boolean} options.activeOnly - Filter for ACTIVE staff only
     * @returns {Promise<Array>} List of staff members
     */
    async getStaffByHotel(hotelId, options = {}) {
        try {
            if (!hotelId) {
                throw new Error('Hotel ID is required');
            }

            const response = await apiService.get(`${API_CONFIG.ENDPOINTS.STAFF_GET_BY_HOTEL}${hotelId}`);
            let staff = response.data || response || [];

            // Ensure array
            if (!Array.isArray(staff)) {
                staff = staff.data || [];
            }

            // Filter for ACTIVE staff if requested (P0 improvement)
            if (options.activeOnly) {
                staff = staff.filter(s => s.status === 'ACTIVE');
            }

            return staff;
        } catch (error) {
            console.error(`Error fetching staff for hotel ${hotelId}:`, error);

            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.message) {
                throw error;
            } else {
                throw new Error('Failed to fetch staff');
            }
        }
    },

    /**
     * Create new staff member
     * @param {Object} staffData - Staff creation data
     * @param {string} staffData.fullName - Staff full name (required)
     * @param {string} staffData.staffType - Staff type (HOUSEKEEPING | MAINTENANCE)
     * @param {string} staffData.phone - Phone number
     * @param {number} staffData.hotelId - Hotel ID (required)
     * @param {string} staffData.notes - Additional notes
     * @returns {Promise<Object>} Created staff object
     */
    async createStaff(staffData) {
        try {
            // Validation
            if (!staffData.fullName) {
                throw new Error('Staff name is required');
            }

            if (!staffData.hotelId) {
                throw new Error('Hotel ID is required');
            }

            const response = await apiService.post(API_CONFIG.ENDPOINTS.STAFF_CREATE, {
                fullName: staffData.fullName,
                staffType: staffData.staffType || 'HOUSEKEEPING',
                phone: staffData.phone || '',
                hotelId: staffData.hotelId,
                notes: staffData.notes || ''
            });

            if (response.status === 'failure') {
                throw new Error(response.message);
            }

            return response.data || response;
        } catch (error) {
            console.error('Error creating staff:', error);

            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.message) {
                throw error;
            } else {
                throw new Error('Failed to create staff');
            }
        }
    },

    /**
     * Update staff status
     * @param {string|number} staffId - Staff ID
     * @param {string} status - ACTIVE | INACTIVE
     * @returns {Promise<Object>} Updated staff object
     */
    async updateStaffStatus(staffId, status) {
        try {
            if (!staffId) {
                throw new Error('Staff ID is required');
            }

            // Validate status enum
            const validStatuses = ['ACTIVE', 'INACTIVE'];
            if (!validStatuses.includes(status)) {
                throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
            }

            const response = await apiService.put(
                `${API_CONFIG.ENDPOINTS.STAFF_UPDATE_STATUS}${staffId}/status?status=${status}`
            );

            if (response.status === 'failure') {
                throw new Error(response.message);
            }

            return response.data || response;
        } catch (error) {
            console.error(`Error updating staff ${staffId} status:`, error);

            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.message) {
                throw error;
            } else {
                throw new Error('Failed to update staff status');
            }
        }
    },

    /**
     * Get staff workload (assigned tasks count)
     * @param {string|number} staffId - Staff ID
     * @returns {Promise<number>} Number of assigned tasks
     */
    async getStaffWorkload(staffId) {
        try {
            if (!staffId) {
                throw new Error('Staff ID is required');
            }

            const response = await apiService.get(`${API_CONFIG.ENDPOINTS.STAFF_WORKLOAD}${staffId}/workload`);
            return response.data?.count || 0;
        } catch (error) {
            console.warn(`Workload not available for staff ${staffId}:`, error);
            return 0;
        }
    }
};

export default staffService;
