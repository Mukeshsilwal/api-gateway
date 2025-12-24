import axios from 'axios';
import {
    UnifiedBookingRequest,
    UnifiedBookingResponse,
    ApiResponse,
} from '../types/unifiedBooking';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Unified Booking API Client
 * Handles communication with the unified booking backend
 */
export const unifiedBookingApi = {
    /**
     * Create a unified booking across multiple services
     */
    async createUnifiedBooking(
        request: UnifiedBookingRequest
    ): Promise<UnifiedBookingResponse> {
        try {
            const response = await axios.post<ApiResponse<UnifiedBookingResponse>>(
                `${API_BASE_URL}/api/booking/unified`,
                request,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000, // 30 seconds
                }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || 'Unified booking failed');
        } catch (error: any) {
            console.error('Unified booking error:', error);

            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }

            if (error.message) {
                throw error;
            }

            throw new Error('Failed to process unified booking. Please try again.');
        }
    },

    /**
     * Get booking details by transaction ID
     */
    async getBookingByTransactionId(transactionId: string): Promise<UnifiedBookingResponse> {
        try {
            const response = await axios.get<ApiResponse<UnifiedBookingResponse>>(
                `${API_BASE_URL}/api/booking/unified/${transactionId}`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || 'Failed to fetch booking');
        } catch (error: any) {
            console.error('Fetch booking error:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch booking details');
        }
    },
};

export default unifiedBookingApi;
