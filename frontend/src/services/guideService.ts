import client from '../api/client';
import API_CONFIG from '../config/api';

export interface Guide {
    guideId: number;
    userId: number;
    fullName: string;
    licenseNumber: string;
    yearsExperience: number;
    bio: string;
    profileImageUrl: string;
    rating: number;
    reviewCount: number;
    specialties: string[];
    languages: string[];
    isActive: boolean;
    verificationStatus?: string;
    rejectionReason?: string;
    verifiedBy?: number;
    verifiedAt?: string;
}

export interface CreateGuideRequest {
    userId: number;
    fullName: string;
    licenseNumber: string;
    yearsExperience: number;
    bio: string;
    profileImageUrl: string;
    specialties: string[];
    languages: string[];
}

const guideService = {
    getAllGuides: async (): Promise<Guide[]> => {
        const response = await client.get(`${API_CONFIG.BFF_PREFIX}/guides`);
        return response.data;
    },

    getGuide: async (guideId: number): Promise<Guide> => {
        const response = await client.get(`${API_CONFIG.BFF_PREFIX}/guides/${guideId}`);
        return response.data;
    },

    createGuide: async (data: CreateGuideRequest): Promise<Guide> => {
        const response = await client.post(`${API_CONFIG.BFF_PREFIX}/guides`, data);
        return response.data;
    },

    verifyGuide: async (guideId: number, verifiedBy: number): Promise<Guide> => {
        const response = await client.patch(`${API_CONFIG.BFF_PREFIX}/guides/${guideId}/verify?verifiedBy=${verifiedBy}`);
        return response.data;
    },

    rejectGuide: async (guideId: number, reason: string, rejectedBy: number): Promise<Guide> => {
        const response = await client.patch(
            `${API_CONFIG.BFF_PREFIX}/guides/${guideId}/reject?reason=${encodeURIComponent(reason)}&rejectedBy=${rejectedBy}`
        );
        return response.data;
    },

    activateGuide: async (guideId: number): Promise<Guide> => {
        const response = await client.patch(`${API_CONFIG.BFF_PREFIX}/guides/${guideId}/activate`);
        return response.data;
    },

    deactivateGuide: async (guideId: number): Promise<Guide> => {
        const response = await client.patch(`${API_CONFIG.BFF_PREFIX}/guides/${guideId}/deactivate`);
        return response.data;
    }
};

export default guideService;
