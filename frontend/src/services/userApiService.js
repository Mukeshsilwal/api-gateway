import apiClient, { API_ENDPOINTS } from '../config/apiConfig';

/**
 * User API Service
 * Handles all user profile and account related API calls
 */
class UserService {
    /**
     * Get user profile
     * @returns {Promise} Response with user profile data
     */
    async getProfile() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.USER.PROFILE);
            return response.data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     * @param {Object} profileData - Profile data to update
     * @returns {Promise} Response with updated profile
     */
    async updateProfile(profileData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, profileData);
            return response.data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    /**
     * Change password
     * @param {Object} passwordData - { currentPassword, newPassword }
     * @returns {Promise} Response with success status
     */
    async changePassword(passwordData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, passwordData);
            return response.data;
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    }

    /**
     * Get user bookings
     * @param {Object} params - { page, size, status }
     * @returns {Promise} Response with user bookings
     */
    async getUserBookings(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.USER.BOOKINGS, { params });
            return response.data;
        } catch (error) {
            console.error('Get user bookings error:', error);
            throw error;
        }
    }

    /**
     * Get user payment history
     * @param {Object} params - { page, size }
     * @returns {Promise} Response with payment history
     */
    async getPaymentHistory(params = {}) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.USER.PAYMENTS, { params });
            return response.data;
        } catch (error) {
            console.error('Get payment history error:', error);
            throw error;
        }
    }
}

export default new UserService();
