/**
 * Hotel API Client
 * Base Path: /api/bff/v1/hotels
 */

import client from '../client';
import type { ApiResponse } from '../types/auth.types';
import type {
    HotelDto,
    RoomDto,
    HotelSearchRequest,
    HotelSearchResponse,
    AvailabilityResponse,
    PriceCalculationResponse,
    RoomLockResponse,
} from '../types/hotel.types';

const BASE_PATH = '/bff/v1/hotels';

export const hotelApi = {
    async searchHotels(searchParams: HotelSearchRequest): Promise<HotelSearchResponse> {
        const response = await client.post<ApiResponse<HotelSearchResponse>>(
            `${BASE_PATH}/search`,
            searchParams
        );
        return response.data.data;
    },

    async getHotel(hotelId: number): Promise<HotelDto> {
        const response = await client.get<ApiResponse<HotelDto>>(
            `${BASE_PATH}/${hotelId}`
        );
        return response.data.data;
    },

    async getRooms(hotelId: number): Promise<RoomDto[]> {
        const response = await client.get<ApiResponse<RoomDto[]>>(
            `${BASE_PATH}/${hotelId}/rooms`
        );
        return response.data.data;
    },

    async checkAvailability(params: any): Promise<AvailabilityResponse> {
        const response = await client.post<ApiResponse<AvailabilityResponse>>(
            `${BASE_PATH}/booking/check-availability`,
            params
        );
        return response.data.data;
    },

    async calculatePrice(params: any): Promise<PriceCalculationResponse> {
        const response = await client.post<ApiResponse<PriceCalculationResponse>>(
            `${BASE_PATH}/booking/calculate-price`,
            params
        );
        return response.data.data;
    },

    async lockRoom(params: any): Promise<RoomLockResponse> {
        const response = await client.post<ApiResponse<RoomLockResponse>>(
            `${BASE_PATH}/booking/lock-room`,
            params
        );
        return response.data.data;
    },

    async createHotel(hotelData: any): Promise<HotelDto> {
        const response = await client.post<ApiResponse<HotelDto>>(
            `${BASE_PATH}/create`,
            hotelData
        );
        return response.data.data;
    },

    async updateHotel(hotelId: number, hotelData: any): Promise<HotelDto> {
        const response = await client.put<ApiResponse<HotelDto>>(
            `${BASE_PATH}/${hotelId}`,
            hotelData
        );
        return response.data.data;
    },

    async deleteHotel(hotelId: number): Promise<void> {
        await client.delete(`${BASE_PATH}/${hotelId}`);
    },

    async createRoom(hotelId: number, roomData: any): Promise<RoomDto> {
        const response = await client.post<ApiResponse<RoomDto>>(
            `${BASE_PATH}/${hotelId}/rooms`,
            roomData
        );
        return response.data.data;
    },

    async updateRoom(roomId: number, roomData: any): Promise<RoomDto> {
        const response = await client.put<ApiResponse<RoomDto>>(
            `${BASE_PATH}/rooms/${roomId}`,
            roomData
        );
        return response.data.data;
    },

    async deleteRoom(roomId: number): Promise<void> {
        await client.delete(`${BASE_PATH}/rooms/${roomId}`);
    },

    async getRecommendations(userId?: number): Promise<any[]> {
        const response = await client.get<ApiResponse<any[]>>(
            `${BASE_PATH}/recommendations`,
            { params: { userId } }
        );
        return response.data.data;
    },
};
