import apiService from './api.service';
import API_CONFIG from '../config/api';

const hotelService = {
    /**
     * Create a new hotel.
     * @param {object} hotelData
     * @returns {Promise<object>}
     */
    createHotel: async (hotelData) => {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.HOTEL_CREATE, hotelData);
            return response.data;
        } catch (error) {
            console.error('Error creating hotel:', error);
            throw error;
        }
    },

    /**
     * Add a room to a hotel.
     * @param {string} hotelCode
     * @param {object} roomData
     * @returns {Promise<object>}
     */
    addRoom: async (hotelCode, roomData) => {
        try {
            const response = await apiService.post(`${API_CONFIG.ENDPOINTS.HOTEL_ADD_ROOM}${hotelCode}/rooms`, roomData);
            return response.data;
        } catch (error) {
            console.error('Error adding room:', error);
            throw error;
        }
    },

    /**
     * Search hotels with filters.
     * @param {object} searchParams - { city, minPrice, maxPrice, minStars, checkIn, checkOut, amenities, sortBy, limit, offset }
     * @returns {Promise<object>}
     */
    searchHotels: async (searchParams) => {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.HOTEL_SEARCH, searchParams);
            return response.data;
        } catch (error) {
            console.error('Error searching hotels:', error);
            throw error;
        }
    }
};

export default hotelService;
