/**
 * Market/Resale API Client
 * Base Path: /api/bff/v1/market
 */

import client from '../client';
import type { ApiResponse } from '../types/auth.types';

const BASE_PATH = '/bff/v1/market';

export const marketApi = {
    // Resale endpoints
    async createResaleListing(data: any): Promise<any> {
        const response = await client.post<ApiResponse<any>>(
            `${BASE_PATH}/resale`,
            data
        );
        return response.data.data;
    },

    async getResaleListings(filters?: any): Promise<any[]> {
        const response = await client.get<ApiResponse<any[]>>(
            `${BASE_PATH}/resale/list`,
            { params: filters }
        );
        return response.data.data;
    },

    async buyResaleTicket(listingId: number, buyerId: number): Promise<void> {
        await client.post(`${BASE_PATH}/resale/${listingId}/buy`, { buyerId });
    },

    async completeResalePurchase(data: any): Promise<void> {
        await client.post(`${BASE_PATH}/resale/complete-buy`, data);
    },

    // Bundle endpoints
    async getBundles(): Promise<any[]> {
        const response = await client.get<ApiResponse<any[]>>(
            `${BASE_PATH}/bundles`
        );
        return response.data.data;
    },

    async bookBundle(bundleId: number, userId: number): Promise<void> {
        await client.post(`${BASE_PATH}/bundles/${bundleId}/book`, { userId });
    },

    // Loyalty endpoints
    async getLoyaltyPoints(userId: number): Promise<any> {
        const response = await client.get<ApiResponse<any>>(
            `${BASE_PATH}/loyalty/${userId}`
        );
        return response.data.data;
    },

    async getLoyaltyHistory(userId: number): Promise<any[]> {
        const response = await client.get<ApiResponse<any[]>>(
            `${BASE_PATH}/loyalty/${userId}/history`
        );
        return response.data.data;
    },

    // Pricing endpoints
    async getPricing(): Promise<any> {
        const response = await client.get<ApiResponse<any>>(
            `${BASE_PATH}/pricing`
        );
        return response.data.data;
    },

    // Dashboard endpoints
    async getLiveDashboard(eventId: number): Promise<any> {
        const response = await client.get<ApiResponse<any>>(
            `${BASE_PATH}/dashboard/live/${eventId}`
        );
        return response.data.data;
    },

    async getOrganizerDashboard(eventId: number): Promise<any> {
        const response = await client.get<ApiResponse<any>>(
            `${BASE_PATH}/dashboard/organizer/${eventId}`
        );
        return response.data.data;
    },

    // Crowd & Live features
    async getCrowdHeatmap(eventId: number): Promise<any> {
        const response = await client.get<ApiResponse<any>>(
            `${BASE_PATH}/crowd/heatmap/${eventId}`
        );
        return response.data.data;
    },

    async getLivePolls(eventId: number): Promise<any[]> {
        const response = await client.get<ApiResponse<any[]>>(
            `${BASE_PATH}/live/polls/${eventId}`
        );
        return response.data.data;
    },

    async voteInPoll(data: any): Promise<void> {
        await client.post(`${BASE_PATH}/live/vote`, data);
    },

    async getLiveMenu(eventId: number): Promise<any> {
        const response = await client.get<ApiResponse<any>>(
            `${BASE_PATH}/live/menu/${eventId}`
        );
        return response.data.data;
    },

    async placeOrder(data: any): Promise<void> {
        await client.post(`${BASE_PATH}/live/order`, data);
    },
};
