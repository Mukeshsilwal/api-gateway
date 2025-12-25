import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const safetyApi = axios.create({
    baseURL: `${API_BASE_URL}/api/bff/safety`,
    headers: {
        'Content-Type': 'application/json',
    },
});

safetyApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface SOSTriggerData {
    tripId?: number;
    latitude: number;
    longitude: number;
    message?: string;
}

export interface SOSTriggerResponse {
    sosId: number;
    userId: number;
    status: string;
    createdAt: string;
}

export const triggerSOS = async (data: SOSTriggerData): Promise<SOSTriggerResponse> => {
    const response = await safetyApi.post('/sos/trigger', data);
    return response.data;
};

export const updateSOSHeartbeat = async (sosId: number, location: { latitude: number; longitude: number }): Promise<void> => {
    await safetyApi.post(`/sos/${sosId}/heartbeat`, location);
};

export const getActiveSOS = async (): Promise<SOSTriggerResponse[]> => {
    const response = await safetyApi.get('/active');
    return response.data;
};

export const getSystemActiveSOS = async (): Promise<SOSTriggerResponse[]> => {
    const response = await safetyApi.get('/system/active');
    return response.data;
};

export const getTripSafetyStatus = async (tripId: number): Promise<any> => {
    const response = await safetyApi.get(`/trip/${tripId}/status`);
    return response.data;
};

export default {
    triggerSOS,
    updateSOSHeartbeat,
    getActiveSOS,
    getTripSafetyStatus
};
