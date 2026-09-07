// src/services/hotel.service.js
import apiService from './api.service';
import API_CONFIG from '../config/api';

/**
 * Hotel Service
 * Provides methods for hotel and room management
 * @module HotelService
 */
const hotelService = {
    /**
     * Get all hotels
     * @returns {Promise<Array>} List of all hotels
     */
    async getAllHotels(options = {}) {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.GET_ALL_HOTELS, options);
            console.log('Raw hotel response:', response);

            // ApiService already unwraps { code, message, data }
            // So response might be the data directly, or still wrapped
            let hotels = response;

            // If response has a 'data' property, use that
            if (response && typeof response === 'object' && response.data) {
                hotels = response.data;
            }

            // Ensure it's an array
            if (!Array.isArray(hotels)) {
                console.warn('Hotels response is not an array:', hotels);
                return [];
            }

            console.log(`Fetched ${hotels.length} hotels`);
            return hotels;
        } catch (error) {
            console.error('Error fetching hotels:', error);
            throw error;
        }
    },

    /**
     * Get hotel by ID
     * @param {number|string} hotelId - Hotel ID
     * @returns {Promise<Object>} Hotel details with rooms
     */
    async getHotelById(hotelId) {
        try {
            const isNumeric = /^\d+$/.test(String(hotelId).trim());
            const url = isNumeric
                ? `${API_CONFIG.ENDPOINTS.HOTEL_DETAILS}${hotelId}`
                : `${API_CONFIG.ENDPOINTS.GET_HOTEL_BY_ID}${hotelId}`;
            const response = await apiService.get(url);
            return response.data || response;
        } catch (error) {
            console.error(`Error fetching hotel ${hotelId}:`, error);
            throw error;
        }
    },

    /**
     * Search hotels by criteria
     * @param {Object} criteria - Search criteria
     * @param {string} criteria.city - City name
     * @param {number} criteria.minPrice - Minimum price
     * @param {number} criteria.maxPrice - Maximum price
     * @param {number} criteria.minStars - Minimum stars
     * @param {number} criteria.minRating - Minimum rating
     * @param {string} criteria.checkIn - Check-in date
     * @param {string} criteria.checkOut - Check-out date
     * @param {number} criteria.guests - Number of guests
     * @param {string[]} criteria.amenities - List of amenities
     * @param {string} criteria.sortBy - Sort order (PRICE_ASC, etc.)
     * @param {number} criteria.limit - Limit results
     * @param {number} criteria.offset - Pagination offset
     * @param {Object} options - Additional options
     * @param {AbortSignal} options.signal - AbortController signal for cancellation
     * @returns {Promise<Array>} List of matching hotels
     */
    async searchHotels(criteria, options = {}) {
        try {
            const response = await apiService.post(
                API_CONFIG.ENDPOINTS.HOTEL_SEARCH,
                criteria,
                { signal: options.signal }
            );
            return response.data || response;
        } catch (error) {
            console.error('Error searching hotels:', error);
            throw error;
        }
    },

    /**
     * Create a new hotel (Admin only)
     * @param {Object} hotelData - Hotel information
     * @returns {Promise<Object>} Created hotel
     */
    async createHotel(hotelData) {
        try {
            console.log('Creating hotel with data:', hotelData);
            const response = await apiService.post(
                API_CONFIG.ENDPOINTS.HOTEL_CREATE,
                hotelData
            );
            return response.data || response;
        } catch (error) {
            console.error('Error creating hotel:', error);
            throw error;
        }
    },

    /**
     * Update existing hotel (Admin only)
     * @param {number|string} hotelId - Hotel ID
     * @param {Object} hotelData - Updated hotel information
     * @returns {Promise<Object>} Updated hotel
     */
    async updateHotel(hotelId, hotelData) {
        try {
            const response = await apiService.put(
                `${API_CONFIG.ENDPOINTS.UPDATE_HOTEL}${hotelId}`,
                hotelData
            );
            return response.data || response;
        } catch (error) {
            console.error(`Error updating hotel ${hotelId}:`, error);
            throw error;
        }
    },

    /**
     * Delete hotel (Admin only)
     * @param {number|string} hotelId - Hotel ID
     * @returns {Promise<string>} Success message
     */
    async deleteHotel(hotelId) {
        try {
            const response = await apiService.delete(
                `${API_CONFIG.ENDPOINTS.DELETE_HOTEL}${hotelId}`
            );
            return response.data || response;
        } catch (error) {
            console.error(`Error deleting hotel ${hotelId}:`, error);
            throw error;
        }
    },

    // ==================== ROOM METHODS ====================

    /**
     * Get all rooms for a specific hotel
     * @param {number|string} hotelId - Hotel ID
     * @returns {Promise<Array>} List of rooms
     */
    async getRoomsByHotel(hotelId) {
        try {
            const isNumeric = /^\d+$/.test(String(hotelId).trim());
            const url = isNumeric
                ? `/api/bff/v1/hotels/hotel/${hotelId}/rooms`
                : `${API_CONFIG.ENDPOINTS.GET_ROOMS_BY_HOTEL}${hotelId}/rooms`;
            const response = await apiService.get(url);
            return response.data || response;
        } catch (error) {
            console.error(`Error fetching rooms for hotel ${hotelId}:`, error);
            throw error;
        }
    },

    /**
     * Get room by ID
     * @param {number|string} roomId - Room ID
     * @returns {Promise<Object>} Room details
     */
    async getRoomById(roomId) {
        try {
            const response = await apiService.get(
                `${API_CONFIG.ENDPOINTS.GET_ROOM_BY_ID}${roomId}`
            );
            return response.data || response;
        } catch (error) {
            console.error(`Error fetching room ${roomId}:`, error);
            throw error;
        }
    },

    /**
     * Add a new room to a hotel (Admin only)
     * @param {number|string} hotelId - Hotel ID
     * @param {Object} roomData - Room information
     * @returns {Promise<Object>} Created room
     */
    async addRoom(hotelId, roomData) {
        try {
            const response = await apiService.post(
                `${API_CONFIG.ENDPOINTS.ADD_ROOM_TO_HOTEL}${hotelId}/rooms`,
                roomData
            );
            return response.data || response;
        } catch (error) {
            console.error(`Error adding room to hotel ${hotelId}:`, error);
            throw error;
        }
    },

    /**
     * Update existing room (Admin only)
     * @param {number|string} roomId - Room ID
     * @param {Object} roomData - Updated room information
     * @returns {Promise<Object>} Updated room
     */
    async updateRoom(roomId, roomData) {
        try {
            const response = await apiService.put(
                `${API_CONFIG.ENDPOINTS.UPDATE_ROOM}${roomId}`,
                roomData
            );
            return response.data || response;
        } catch (error) {
            console.error(`Error updating room ${roomId}:`, error);
            throw error;
        }
    },

    /**
     * Delete room (Admin only)
     * @param {number|string} roomId - Room ID
     * @returns {Promise<string>} Success message
     */
    async deleteRoom(roomId) {
        try {
            const response = await apiService.delete(
                `${API_CONFIG.ENDPOINTS.DELETE_ROOM}${roomId}`
            );
            return response.data || response;
        } catch (error) {
            console.error(`Error deleting room ${roomId}:`, error);
            throw error;
        }
    },

    // ==================== RECOMMENDATION METHODS ====================

    /**
     * Get nearby hotels based on location and filters (POST)
     * @param {Object} params - Search parameters
     * @param {number} params.latitude - User latitude
     * @param {number} params.longitude - User longitude
     * @param {number} params.radiusKm - Search radius in km (default 10)
     * @param {number|null} params.minStarRating - Minimum star rating filter
     * @param {number|null} params.maxPrice - Maximum price filter
     * @param {string[]|null} params.amenities - Amenities filter
     * @param {string} params.sortBy - Sort by: distance, price, rating
     * @param {number} params.page - Page number (default 1)
     * @param {number} params.limit - Results per page (default 10)
     * @returns {Promise<Object>} Hotels list with pagination info
     */
    async getNearbyHotels(params) {
        try {
            const response = await apiService.post(
                API_CONFIG.ENDPOINTS.HOTELS_NEARBY,
                params
            );
            return response.data || response;
        } catch (error) {
            console.error('Error fetching nearby hotels:', error);
            throw error;
        }
    },

    /**
     * Get nearby hotels using GET endpoint
     * @param {Object} queryParams - Query parameters
     * @returns {Promise<Object>} Hotels list
     */
    async getNearbyHotelsSimple(queryParams) {
        try {
            const params = new URLSearchParams();
            if (queryParams.lat) params.append('lat', queryParams.lat);
            if (queryParams.lon) params.append('lon', queryParams.lon);
            if (queryParams.radius) params.append('radius', queryParams.radius);
            if (queryParams.minStars) params.append('minStars', queryParams.minStars);
            if (queryParams.sortBy) params.append('sortBy', queryParams.sortBy);
            if (queryParams.page) params.append('page', queryParams.page);
            if (queryParams.limit) params.append('limit', queryParams.limit);

            const response = await apiService.get(
                `${API_CONFIG.ENDPOINTS.HOTELS_NEARBY}?${params.toString()}`
            );
            return response.data || response;
        } catch (error) {
            console.error('Error fetching nearby hotels (GET):', error);
            throw error;
        }
    },

    /**
     * Get personalized hotel recommendations
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {number} limit - Number of recommendations (default 10)
     * @param {string|null} userId - Optional user ID for personalization
     * @returns {Promise<Array>} Recommended hotels
     */
    async getRecommendations(lat, lon, limit = 10, userId = null) {
        try {
            const params = new URLSearchParams({
                lat: lat.toString(),
                lon: lon.toString(),
                limit: limit.toString()
            });

            const headers = userId ? { 'X-User-Id': userId } : {};

            const response = await apiService.get(
                `${API_CONFIG.ENDPOINTS.HOTELS_RECOMMENDATIONS}?${params.toString()}`,
                { headers }
            );
            return response.data || response;
        } catch (error) {
            console.error('Error fetching hotel recommendations:', error);
            throw error;
        }
    },

    /**
     * Get featured hotels
     * @param {number} limit - Number of featured hotels to fetch (default 10)
     * @returns {Promise<Array>} Featured hotels
     */
    async getFeaturedHotels(limit = 10) {
        try {
            const response = await apiService.get(
                `${API_CONFIG.ENDPOINTS.HOTELS_FEATURED}?limit=${limit}`
            );
            return response.data || response;
        } catch (error) {
            console.error('Error fetching featured hotels:', error);
            throw error;
        }
    },

    /**
     * Search hotels by city
     * @param {string} city - City name
     * @param {number} page - Page number (default 1)
     * @param {number} limit - Results per page (default 10)
     * @returns {Promise<Object>} Hotels list with pagination
     */
    async searchByCity(city, page = 1, limit = 10) {
        try {
            const response = await apiService.get(
                `${API_CONFIG.ENDPOINTS.HOTELS_SEARCH_CITY}${city}?page=${page}&limit=${limit}`
            );
            return response.data || response;
        } catch (error) {
            console.error(`Error searching hotels in ${city}:`, error);
            throw error;
        }
    },

    // ==================== BOOKING METHODS ====================

    /**
     * Book a hotel room
     * @param {Object} bookingData - Booking information matching HotelBookingRequest
     * @returns {Promise<Object>} Booking response
     */
    async bookHotel(bookingData) {
        try {
            // Unified booking endpoint
            return await apiService.post(
                `${API_CONFIG.BFF_PREFIX}/bookings/complete`,
                bookingData
            );
        } catch (error) {
            console.error('Error booking hotel:', error);
            throw error;
        }
    }
};

export default hotelService;
