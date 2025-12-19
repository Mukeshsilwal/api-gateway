import apiService from './api.service';
import API_CONFIG from '../config/api';

/**
 * @typedef {Object} PaymentProvider
 * @property {string} id
 * @property {string} name
 * @property {boolean} active
 */

/**
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} serviceName
 * @property {string} status
 * @property {string} date
 * @property {number} amount
 */

/**
 * @typedef {Object} Hotel
 * @property {string} id
 * @property {string} name
 * @property {number} rating
 * @property {string} image
 * @property {string} location
 */

/**
 * @typedef {Object} DashboardData
 * @property {PaymentProvider[]} paymentProviders
 * @property {Booking[]} recentBookings
 * @property {Hotel[]} recommendedHotels
 * @property {Object} errors - Partial failure details
 */

const CACHE_KEY = 'web_bff_dashboard_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class WebBffService {
    /**
     * Fetch aggregated dashboard data from Web BFF
     * Handles caching, retries (via apiService), and partial data mapping.
     * @returns {Promise<DashboardData>}
     */
    async getDashboardData() {
        // 1. Try to serve from cache first
        const cached = this._getFromCache();
        if (cached) {
            console.log('Serving dashboard data from cache');
            // Background revalidate (stale-while-revalidate pattern optional, 
            // but for now we just return cached if valid)
            return cached;
        }

        try {
            // 2. Call Web BFF Endpoint
            // apiService already handles retries (2 times)
            const response = await apiService.get(API_CONFIG.ENDPOINTS.HOME);

            // 3. Map and Validate Data
            // We expect the response to act as a "data" property wrapper if standard structure is used
            const rawData = response.data || response;

            const mappedData = this._mapResponseToModel(rawData);

            // 4. Save to Cache
            this._saveToCache(mappedData);

            return mappedData;

        } catch (error) {
            console.error('Web BFF call failed:', error);

            // 5. Fallback to expired cache if available (graceful degradation)
            const staleCache = this._getFromCache(true);
            if (staleCache) {
                console.warn('Returning stale cache due to API failure');
                return {
                    ...staleCache,
                    errors: { general: 'Using offline data. Some information may be outdated.' }
                };
            }

            throw error;
        }
    }

    /**
     * Maps raw BFF response to frontend models dynamically.
     * Adapt to structure changes and log warnings.
     */
    _mapResponseToModel(data) {
        const result = {
            paymentProviders: [],
            recentBookings: [],
            recommendedHotels: [],
            errors: {}
        };

        if (!data) return result;

        // Map Payments
        if (Array.isArray(data.paymentProviders)) {
            result.paymentProviders = data.paymentProviders.map(p => ({
                id: p.id || p.code,
                name: p.name,
                active: p.isActive ?? true
            }));
        } else {
            console.warn('BFF Warning: Missing or invalid "paymentProviders" field');
        }

        // Map Bookings
        if (Array.isArray(data.bookings)) {
            result.recentBookings = data.bookings.map(b => ({
                id: b.bookingId || b.id,
                serviceName: b.serviceType || 'General',
                status: b.status || 'Unknown',
                date: b.bookingDate || b.date,
                amount: b.totalAmount || 0
            }));
        } else if (Array.isArray(data.recentBookings)) {
            // Adapt to alternative naming
            result.recentBookings = data.recentBookings.map(b => ({
                id: b.id,
                serviceName: b.service,
                status: b.status,
                date: b.date,
                amount: b.amount
            }));
        } else {
            console.warn('BFF Warning: Missing or invalid "bookings" field');
            result.errors.bookings = 'Could not load recent bookings';
        }

        // Map Hotels
        if (Array.isArray(data.hotels)) {
            result.recommendedHotels = data.hotels.map(h => ({
                id: h.hotelId || h.id,
                name: h.name,
                rating: h.starRating || h.rating,
                image: h.primaryImage || h.image,
                location: h.city || h.address
            }));
        } else if (Array.isArray(data.featuredHotels)) {
            // Adapt to alternative naming
            result.recommendedHotels = data.featuredHotels;
        } else {
            console.warn('BFF Warning: Missing or invalid "hotels"/featuredHotels field');
        }

        return result;
    }

    _getFromCache(ignoreExpiration = false) {
        try {
            const item = localStorage.getItem(CACHE_KEY);
            if (!item) return null;

            const parsed = JSON.parse(item);
            const now = Date.now();

            if (!ignoreExpiration && (now - parsed.timestamp > CACHE_DURATION)) {
                return null;
            }

            return parsed.data;
        } catch (e) {
            return null;
        }
    }

    _saveToCache(data) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data
            }));
        } catch (e) {
            console.warn('Failed to save to localStorage', e);
        }
    }
}

export const webBffService = new WebBffService();
export default webBffService;
