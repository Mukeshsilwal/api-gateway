import client from '../api/client';
import API_CONFIG from '../config/api';

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
    await client.post(`${API_CONFIG.BFF_PREFIX}/tracking/location`, locationData);
};

// Get latest location
export const getLatestLocation = async (entityType: string, entityId: number): Promise<Location> => {
    const response = await client.get(`${API_CONFIG.BFF_PREFIX}/tracking/${entityType}/${entityId}/latest`);
    return response.data;
};

// Get location history
export const getLocationHistory = async (
    entityType: string,
    entityId: number,
    hours: number = 24
): Promise<Location[]> => {
    const response = await client.get(`${API_CONFIG.BFF_PREFIX}/tracking/${entityType}/${entityId}/history`, {
        params: { hours },
    });
    return response.data;
};

// Get trip locations
export const getTripLocations = async (tripId: number): Promise<Location[]> => {
    const response = await client.get(`${API_CONFIG.BFF_PREFIX}/tracking/trip/${tripId}`);
    return response.data;
};

// Find nearby POIs
export const findNearbyPOIs = async (
    latitude: number,
    longitude: number,
    radiusKm: number = 5
): Promise<POI[]> => {
    const response = await client.get(`${API_CONFIG.BFF_PREFIX}/tracking/poi/nearby`, {
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
    const response = await client.get(`${API_CONFIG.BFF_PREFIX}/tracking/poi/category/${category}`, {
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
