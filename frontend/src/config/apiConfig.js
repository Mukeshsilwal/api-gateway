import axios from 'axios';

// API Base URLs
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const BFF_BASE_URL = `${API_BASE_URL}/api/bff/v1`;

// API Endpoints
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: `${BFF_BASE_URL}/auth/login`,
        REGISTER: `${BFF_BASE_URL}/auth/register`,
        LOGOUT: `${BFF_BASE_URL}/auth/logout`,
        REFRESH_TOKEN: `${BFF_BASE_URL}/auth/refresh`,
        VERIFY_EMAIL: `${BFF_BASE_URL}/auth/verify-email`,
        FORGOT_PASSWORD: `${BFF_BASE_URL}/auth/forgot-password`,
        RESET_PASSWORD: `${BFF_BASE_URL}/auth/reset-password`,
    },

    // Events
    EVENTS: {
        LIST: `${BFF_BASE_URL}/events`,
        DETAILS: (id) => `${BFF_BASE_URL}/events/${id}`,
        SEARCH: `${BFF_BASE_URL}/events/search`,
        CATEGORIES: `${BFF_BASE_URL}/events/categories`,
        FEATURED: `${BFF_BASE_URL}/events/featured`,
        UPCOMING: `${BFF_BASE_URL}/events/upcoming`,
        TICKETS: (eventId) => `${BFF_BASE_URL}/events/${eventId}/tickets`,
    },

    // Bookings
    BOOKINGS: {
        CREATE: `${BFF_BASE_URL}/bookings`,
        LIST: `${BFF_BASE_URL}/bookings`,
        DETAILS: (id) => `${BFF_BASE_URL}/bookings/${id}`,
        CANCEL: (id) => `${BFF_BASE_URL}/bookings/${id}/cancel`,
        INITIATE: `${BFF_BASE_URL}/bookings/initiate`,
        CONFIRM: (id) => `${BFF_BASE_URL}/bookings/${id}/confirm`,
    },

    // Hotels
    HOTELS: {
        LIST: `${BFF_BASE_URL}/hotels`,
        DETAILS: (id) => `${BFF_BASE_URL}/hotels/${id}`,
        SEARCH: `${BFF_BASE_URL}/hotels/search`,
        ROOMS: (hotelId) => `${BFF_BASE_URL}/hotels/${hotelId}/rooms`,
        AVAILABILITY: (hotelId) => `${BFF_BASE_URL}/hotels/${hotelId}/availability`,
        BOOK: `${BFF_BASE_URL}/hotels/bookings`,
        BOOKING_DETAILS: (id) => `${BFF_BASE_URL}/hotels/bookings/${id}`,
    },

    // Bus
    BUS: {
        LIST: `${BFF_BASE_URL}/buses`,
        DETAILS: (id) => `${BFF_BASE_URL}/buses/${id}`,
        SEARCH: `${BFF_BASE_URL}/buses/search`,
        SEATS: (busId) => `${BFF_BASE_URL}/buses/${busId}/seats`,
        BOOK: `${BFF_BASE_URL}/buses/bookings`,
        BOOKING_DETAILS: (id) => `${BFF_BASE_URL}/buses/bookings/${id}`,
    },

    // Payments
    PAYMENTS: {
        INITIATE: `${BFF_BASE_URL}/payments/initiate`,
        VERIFY: `${BFF_BASE_URL}/payments/verify`,
        STATUS: (id) => `${BFF_BASE_URL}/payments/${id}/status`,
        CALLBACK: `${BFF_BASE_URL}/payments/callback`,
        ESEWA: {
            INITIATE: `${BFF_BASE_URL}/payments/esewa/initiate`,
            VERIFY: `${BFF_BASE_URL}/payments/esewa/verify`,
        },
        KHALTI: {
            INITIATE: `${BFF_BASE_URL}/payments/khalti/initiate`,
            VERIFY: `${BFF_BASE_URL}/payments/khalti/verify`,
        },
        IMEPAY: {
            INITIATE: `${BFF_BASE_URL}/payments/imepay/initiate`,
            VERIFY: `${BFF_BASE_URL}/payments/imepay/verify`,
        },
    },

    // User Profile
    USER: {
        PROFILE: `${BFF_BASE_URL}/users/profile`,
        UPDATE_PROFILE: `${BFF_BASE_URL}/users/profile`,
        CHANGE_PASSWORD: `${BFF_BASE_URL}/users/change-password`,
        BOOKINGS: `${BFF_BASE_URL}/users/bookings`,
        PAYMENTS: `${BFF_BASE_URL}/users/payments`,
    },

    // Admin
    ADMIN: {
        DASHBOARD: `${BFF_BASE_URL}/admin/dashboard`,
        EVENTS: {
            SEARCH: `${BFF_BASE_URL}/events/search`,
            CREATE: `${BFF_BASE_URL}/events`,
            DETAILS: (id) => `${BFF_BASE_URL}/events/${id}`,
            UPDATE: (id) => `${BFF_BASE_URL}/events/${id}`,
            PUBLISH: (id) => `${BFF_BASE_URL}/events/${id}/publish`,
            CANCEL: (id) => `${BFF_BASE_URL}/events/${id}/cancel`,
            ANALYTICS: (id) => `${BFF_BASE_URL}/events/${id}/analytics`,
            ORGANIZER_EVENTS: (organizerId) => `${BFF_BASE_URL}/organizers/${organizerId}/events`,
        },
        BOOKINGS: `${BFF_BASE_URL}/admin/bookings`,
        USERS: `${BFF_BASE_URL}/admin/users`,
    },
};

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add auth token
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add session ID if available
        const sessionId = sessionStorage.getItem('sessionId');
        if (sessionId) {
            config.headers['Session-Id'] = sessionId;
        }

        // Add correlation ID for tracing
        const correlationId = `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        config.headers['X-Correlation-ID'] = correlationId;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
                        refreshToken,
                    });

                    const { accessToken } = response.data.data;
                    localStorage.setItem('accessToken', accessToken);

                    // Retry original request
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle network errors
        if (!error.response) {
            error.message = 'Network error. Please check your internet connection.';
        }

        // Handle other errors
        if (error.response?.data?.message) {
            error.message = error.response.data.message;
        }

        return Promise.reject(error);
    }
);

export default apiClient;
