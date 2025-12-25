import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088/tracking-service';

const trackingApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
trackingApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface LocationUpdate {
    tripId?: number;
    entityType: 'BUS' | 'TOURIST' | 'GUIDE' | 'VEHICLE';
    entityId: number;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    timestamp?: string;
    isOffline?: boolean;
    batteryLevel?: number;
}

export interface Location {
    locationId: number;
    tripId?: number;
    entityType: string;
    entityId: number;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    timestamp: string;
    isOffline: boolean;
    batteryLevel?: number;
    distanceFromPrevious?: number;
    locationName?: string;
}

export interface POI {
    poiId: number;
    name: string;
    category: string;
    latitude: number;
    longitude: number;
    address?: string;
    region?: string;
    description?: string;
    openingHours?: string;
    touristType?: string;
    rating?: number;
    isVerified: boolean;
    distanceKm?: number;
}

// Submit location update
export const submitLocation = async (locationData: LocationUpdate): Promise<void> => {
    await trackingApi.post('/api/tracking/location', locationData);
};

// Get latest location
export const getLatestLocation = async (entityType: string, entityId: number): Promise<Location> => {
    const response = await trackingApi.get(`/api/tracking/${entityType}/${entityId}/latest`);
    return response.data;
};

// Get location history
export const getLocationHistory = async (
    entityType: string,
    entityId: number,
    hours: number = 24
): Promise<Location[]> => {
    const response = await trackingApi.get(`/api/tracking/${entityType}/${entityId}/history`, {
        params: { hours },
    });
    return response.data;
};

// Get trip locations
export const getTripLocations = async (tripId: number): Promise<Location[]> => {
    const response = await trackingApi.get(`/api/tracking/trip/${tripId}`);
    return response.data;
};

// Find nearby POIs
export const findNearbyPOIs = async (
    latitude: number,
    longitude: number,
    radiusKm: number = 5
): Promise<POI[]> => {
    const response = await trackingApi.get('/api/poi/nearby', {
        params: { latitude, longitude, radiusKm },
    });
    return response.data;
};

// Find POIs by category
export const findPOIsByCategory = async (
    category: string,
    latitude?: number,
    longitude?: number,
    radiusKm: number = 10
): Promise<POI[]> => {
    const response = await trackingApi.get(`/api/poi/category/${category}`, {
        params: { latitude, longitude, radiusKm },
    });
    return response.data;
};

export default {
    submitLocation,
    getLatestLocation,
    getLocationHistory,
    getTripLocations,
    findNearbyPOIs,
    findPOIsByCategory,
};
