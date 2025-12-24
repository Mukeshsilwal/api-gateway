import apiClient from '../services/api.service';

export interface BookingItem {
    type: 'EVENT' | 'BUS' | 'HOTEL';
    payload: any;
}

export interface UnifiedBookingRequest {
    customerId: string;
    bookings: BookingItem[];
}

export interface UnifiedBookingResponse {
    status: number;
    message: string;
    data: any;
    timestamp: string;
}

/**
 * Create a unified booking with multiple items
 */
export const createUnifiedBooking = async (
    request: UnifiedBookingRequest,
    token: string
): Promise<UnifiedBookingResponse> => {
    try {
        const response = await apiClient.post(
            '/api/booking/unified',
            request,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.message || 'Unified booking failed';
        throw new Error(message);
    }
};

/**
 * Get booking status
 */
export const getBookingStatus = async (
    bookingId: string,
    token: string
): Promise<any> => {
    try {
        const response = await apiClient.get(
            `/api/booking/${bookingId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to get booking status');
    }
};
