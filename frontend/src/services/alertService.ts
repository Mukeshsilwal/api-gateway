import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089/alert-service';

const alertApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
alertApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Alert {
    alertId: number;
    alertType: 'WEATHER' | 'ROAD_BLOCK' | 'DELAY' | 'STRIKE' | 'EMERGENCY' | 'SAFETY' | 'MAINTENANCE' | 'EVENT';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    affectedRegion?: string;
    affectedRoutes?: string[];
    affectedDistricts?: string[];
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    validFrom: string;
    validUntil?: string;
    isActive: boolean;
    source?: string;
    createdBy?: string;
    createdAt: string;
    isCurrentlyValid?: boolean;
    minutesUntilExpiry?: number;
}

export interface CreateAlertRequest {
    alertType: string;
    severity: string;
    title: string;
    description: string;
    affectedRegion?: string;
    affectedRoutes?: string[];
    affectedDistricts?: string[];
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    validFrom: string;
    validUntil?: string;
}

// Get active alerts
export const getActiveAlerts = async (): Promise<Alert[]> => {
    const response = await alertApi.get('/api/alerts/active');
    return response.data;
};

// Get alerts by region
export const getAlertsByRegion = async (region: string): Promise<Alert[]> => {
    const response = await alertApi.get(`/api/alerts/region/${region}`);
    return response.data;
};

// Get alerts by route
export const getAlertsByRoute = async (route: string): Promise<Alert[]> => {
    const response = await alertApi.get(`/api/alerts/route/${route}`);
    return response.data;
};

// Get alerts by severity
export const getAlertsBySeverity = async (severities: string[]): Promise<Alert[]> => {
    const response = await alertApi.get('/api/alerts/severity', {
        params: { severities: severities.join(',') },
    });
    return response.data;
};

// Create alert (admin only)
export const createAlert = async (alertData: CreateAlertRequest): Promise<Alert> => {
    const response = await alertApi.post('/api/alerts', alertData);
    return response.data;
};

// Resolve alert (admin only)
export const resolveAlert = async (alertId: number): Promise<Alert> => {
    const response = await alertApi.put(`/api/alerts/${alertId}/resolve`);
    return response.data;
};

export default {
    getActiveAlerts,
    getAlertsByRegion,
    getAlertsByRoute,
    getAlertsBySeverity,
    createAlert,
    resolveAlert,
};
