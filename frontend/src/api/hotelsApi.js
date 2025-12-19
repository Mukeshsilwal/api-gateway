import axios from 'axios';
import API_CONFIG from '../config/api';

const BASE_URL = API_CONFIG.BASE_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 second timeout
});

// Enhanced cache with request deduplication
const cache = {
    cities: null,
    filters: null,
    timestamp: 0,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    pendingRequests: new Map(), // Prevent duplicate simultaneous requests
};

// Request deduplication helper
const dedupedRequest = async (key, requestFn) => {
    // If request is already pending, wait for it
    if (cache.pendingRequests.has(key)) {
        return cache.pendingRequests.get(key);
    }

    // Create new request promise
    const promise = requestFn().finally(() => {
        cache.pendingRequests.delete(key);
    });

    cache.pendingRequests.set(key, promise);
    return promise;
};

/**
 * @typedef {Object} NearbyHotelRequest
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} [radiusKm] - 1-50 KM
 * @property {number} [minStarRating] - 1-5 stars
 * @property {number} [maxPrice]
 * @property {string[]} [amenities]
 * @property {string} [sortBy]
 * @property {number} [page] - >= 1
 * @property {number} [limit]
 */

/**
 * @typedef {Object} HotelSearchRequest
 * @property {string} [city]
 * @property {string} [searchQuery]
 * @property {number} [latitude]
 * @property {number} [longitude]
 * @property {number} [minStarRating] - 1-5 stars
 * @property {number} [minPrice]
 * @property {number} [maxPrice]
 * @property {string[]} [amenities]
 * @property {string} [sortBy]
 * @property {number} [page] - >= 1
 * @property {number} [limit]
 */

/**
 * @typedef {Object} HotelAvailabilityRequest
 * @property {number|string} hotelId
 * @property {string} checkInDate
 * @property {string} checkOutDate
 * @property {number} numberOfRooms
 * @property {number} numberOfGuests
 */

const hotelsApi = {
    // ==================== LOCATION-BASED SEARCH ====================

    /**
     * GET /api/hotels/nearby - Quick nearby hotels search
     * @param {Object} params - Query parameters
     */
    getNearbyHotels: async (params) => {
        const response = await api.get(API_CONFIG.ENDPOINTS.HOTELS_NEARBY, { params });
        return response.data;
    },

    /**
     * POST /api/hotels/nearby - Advanced nearby search with filters
     * @param {NearbyHotelRequest} data
     */
    searchNearbyHotels: async (data) => {
        const response = await api.post(API_CONFIG.ENDPOINTS.HOTELS_NEARBY, data);
        return response.data;
    },

    // ==================== SEARCH & FILTER ====================

    /**
     * POST /api/hotels/search - Advanced hotel search
     * @param {HotelSearchRequest} data
     */
    searchHotels: async (data) => {
        const response = await api.post(API_CONFIG.ENDPOINTS.HOTEL_SEARCH, data);
        return response.data;
    },

    /**
     * GET /api/hotels/search/city/{city} - Search hotels by city
     * @param {string} city - City name
     */
    searchByCity: async (city) => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.HOTELS_SEARCH_CITY}${encodeURIComponent(city)}`);
        return response.data;
    },

    /**
     * GET /api/hotels/by-stars - Filter hotels by star rating
     * @param {number} rating - Star rating (1-5)
     */
    getHotelsByStars: async (rating) => {
        const response = await api.get(API_CONFIG.ENDPOINTS.HOTELS_BY_STARS, {
            params: { rating: Math.max(1, Math.min(5, rating)) }
        });
        return response.data;
    },

    // ==================== DISCOVERY & LISTS ====================

    /**
     * GET /api/hotels/recommendations - Personalized hotel recommendations
     */
    getRecommendations: async () => {
        return dedupedRequest('recommendations', async () => {
            const response = await api.get(API_CONFIG.ENDPOINTS.HOTELS_RECOMMENDATIONS);
            return response.data;
        });
    },

    /**
     * GET /api/hotels/featured - Featured/popular hotels
     */
    getFeaturedHotels: async () => {
        return dedupedRequest('featured', async () => {
            const response = await api.get(API_CONFIG.ENDPOINTS.HOTELS_FEATURED);
            return response.data;
        });
    },

    /**
     * GET /api/hotels/top-rated - Top-rated hotels
     */
    getTopRatedHotels: async () => {
        return dedupedRequest('topRated', async () => {
            const response = await api.get(API_CONFIG.ENDPOINTS.HOTELS_TOP_RATED);
            return response.data;
        });
    },

    /**
     * GET /api/hotels/budget - Budget-friendly hotels
     */
    getBudgetHotels: async () => {
        return dedupedRequest('budget', async () => {
            const response = await api.get(API_CONFIG.ENDPOINTS.HOTELS_BUDGET);
            return response.data;
        });
    },

    // ==================== HOTEL DETAILS ====================

    /**
     * GET /api/hotels/{hotelId} - Get hotel details by ID
     * @param {number|string} id - Hotel ID
     */
    getHotelDetails: async (id) => {
        // Use GET_HOTEL_BY_ID to support fetching by code (e.g. SRdddHddd1)
        const response = await api.get(`${API_CONFIG.ENDPOINTS.GET_HOTEL_BY_ID}${id}`);
        // Unwrap if wrapped in standard API response { code, message, data }
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    /**
     * GET /api/hotels/{hotelId}/rooms - Get rooms for a hotel
     * @param {number|string} hotelId - Hotel ID
     */
    getHotelRooms: async (hotelId) => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.GET_ROOMS_BY_HOTEL}${hotelId}/rooms`);
        // Unwrap if wrapped in standard API response { code, message, data }
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    /**
     * GET /api/hotels/recommended/{hotelId} - Get detailed recommended hotel
     * @param {number|string} hotelId - Hotel ID
     */
    getRecommendedHotelDetails: async (hotelId) => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.HOTEL_RECOMMENDED_DETAILS}${hotelId}`);
        return response.data;
    },

    // ==================== STATIC DATA (CACHED) ====================

    /**
     * GET /api/hotels/cities - Get list of cities with hotels
     * Cached for 5 minutes with request deduplication
     */
    getCities: async () => {
        const now = Date.now();

        // Return cached data if valid
        if (cache.cities && (now - cache.timestamp < cache.CACHE_DURATION)) {
            return cache.cities;
        }

        // Deduplicate concurrent requests
        return dedupedRequest('cities', async () => {
            const response = await api.get(API_CONFIG.ENDPOINTS.HOTELS_CITIES);

            // Handle different response structures
            let citiesData = response.data;

            // Unwrap if wrapped in { code, message, data } structure
            if (citiesData && typeof citiesData === 'object' && citiesData.data) {
                citiesData = citiesData.data;
            }

            // Ensure we always return an array
            const cities = Array.isArray(citiesData) ? citiesData : [];

            // Update cache
            cache.cities = cities;
            cache.timestamp = now;

            return cities;
        });
    },

    /**
     * GET /api/hotels/filters - Get available filter options
     * Cached for 5 minutes with request deduplication
     */
    getFilters: async () => {
        const now = Date.now();

        // Return cached data if valid
        if (cache.filters && (now - cache.timestamp < cache.CACHE_DURATION)) {
            return cache.filters;
        }

        // Deduplicate concurrent requests
        return dedupedRequest('filters', async () => {
            const response = await api.get(API_CONFIG.ENDPOINTS.HOTELS_FILTERS);

            // Handle different response structures
            let filtersData = response.data;

            // Unwrap if wrapped in { code, message, data } structure
            if (filtersData && typeof filtersData === 'object' && filtersData.data) {
                filtersData = filtersData.data;
            }

            // Ensure we have a valid filters object
            const filters = (filtersData && typeof filtersData === 'object') ? filtersData : {};

            // Update cache
            cache.filters = filters;
            cache.timestamp = now;

            return filters;
        });
    },

    /**
     * GET /api/hotels/cities/{city}/stats - Get statistics for a city
     * @param {string} city - City name
     */
    getCityStats: async (city) => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.HOTELS_CITY_STATS}${encodeURIComponent(city)}/stats`);
        return response.data;
    },

    // ==================== AVAILABILITY ====================

    /**
     * POST /api/hotels/{hotelId}/availability - Check hotel availability
     * @param {number|string} hotelId - Hotel ID
     * @param {HotelAvailabilityRequest} data - Availability request data
     */
    checkAvailability: async (hotelId, data) => {
        const response = await api.post(`${API_CONFIG.ENDPOINTS.HOTEL_AVAILABILITY}${hotelId}/availability`, {
            hotelId,
            ...data
        });
        return response.data;
    },

    // ==================== UTILITY METHODS ====================

    /**
     * Clear all cached data
     */
    clearCache: () => {
        cache.cities = null;
        cache.filters = null;
        cache.timestamp = 0;
        cache.pendingRequests.clear();
    },

    /**
     * Validate hotel search parameters
     * @param {Object} params - Search parameters
     * @returns {Object} - Validation result
     */
    validateSearchParams: (params) => {
        const errors = [];

        if (params.minStarRating !== undefined) {
            if (params.minStarRating < 1 || params.minStarRating > 5) {
                errors.push('Star rating must be between 1 and 5');
            }
        }

        if (params.radiusKm !== undefined) {
            if (params.radiusKm < 1 || params.radiusKm > 50) {
                errors.push('Radius must be between 1 and 50 KM');
            }
        }

        if (params.page !== undefined && params.page < 1) {
            errors.push('Page number must be >= 1');
        }

        if (params.latitude !== undefined && (params.latitude < -90 || params.latitude > 90)) {
            errors.push('Latitude must be between -90 and 90');
        }

        if (params.longitude !== undefined && (params.longitude < -180 || params.longitude > 180)) {
            errors.push('Longitude must be between -180 and 180');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
};

export default hotelsApi;
