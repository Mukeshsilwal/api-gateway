import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const tripApi = axios.create({
    baseURL: `${API_BASE_URL}/api/bff/trips`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
tripApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Trip {
    tripId: number;
    userId: number;
    guideId?: number;
    tripName: string;
    tripType: string;
    touristType: string;
    status: string;
    startDate: string;
    endDate: string;
    budget: number;
    actualCost: number;
    description: string;
    durationDays: number;
    budgetRemaining: number;
    progressPercentage: number;
    checkpoints?: any[];
    bookings?: any[];
    participants?: any[];
}

export interface JourneyDTO {
    journeyId: number;
    tripId: number;
    userId: number;
    status: string;
    itineraryDayId?: number;
    bookingReference?: any;
    totalEstimatedCost?: number;
    type?: string;
}

export interface CheckpointDTO {
    checkpointId?: number;
    journeyId?: number;
    tripId?: number;
    locationName: string;
    scheduledTime: string;
    checkpointType: 'DEPARTURE' | 'TRANSIT' | 'ARRIVAL' | 'HOTEL_CHECKIN' | 'HOTEL_CHECKOUT' | 'ACTIVITY' | 'RETURN';
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';
    notes?: string;
    latitude?: number;
    longitude?: number;
}

export interface CreateTripRequest {
    tripName: string;
    tripType: 'LEISURE' | 'BUSINESS' | 'ADVENTURE' | 'CULTURAL' | 'PILGRIMAGE';
    touristType: 'NEPALI' | 'INTERNATIONAL';
    startDate: string;
    endDate: string;
    budget: number;
    description?: string;
    guideId?: number;
}

export interface TripDashboard {
    trip: Trip;
    bookings: any[];
    liveTracking: {
        hasLiveData: boolean;
        latestLocation?: any;
        locations: any[];
    };
    activeAlerts: any[];
    recommendations?: any[];
    bookingSummary?: {
        total: number;
        confirmed: number;
        pending: number;
    };
}

// Get trip dashboard (aggregated data)
export const getTripDashboard = async (tripId: number): Promise<TripDashboard> => {
    const response = await tripApi.get(`/${tripId}/dashboard`);
    return response.data;
};

// Get user's trips
export const getMyTrips = async (): Promise<Trip[]> => {
    const response = await tripApi.get('/my-trips');
    return response.data;
};

// Get user's trips by status
export const getMyTripsByStatus = async (status: string): Promise<Trip[]> => {
    const response = await tripApi.get(`/my-trips/status/${status}`);
    return response.data;
};

// Create trip (via BFF)
export const createTrip = async (tripData: CreateTripRequest): Promise<Trip> => {
    const response = await tripApi.post('', tripData);
    return response.data;
};

// Get trip by ID (via BFF)
export const getTripById = async (tripId: number): Promise<Trip> => {
    const response = await tripApi.get(`/${tripId}`);
    return response.data;
};

// Get trip details (via BFF)
export const getTripDetails = async (tripId: number): Promise<Trip> => {
    const response = await tripApi.get(`/${tripId}/details`);
    return response.data;
};

// Update trip (via BFF)
export const updateTrip = async (tripId: number, tripData: Partial<CreateTripRequest>): Promise<Trip> => {
    const response = await tripApi.put(`/${tripId}`, tripData);
    return response.data;
};

// Update trip status (via BFF)
export const updateTripStatus = async (tripId: number, status: string): Promise<Trip> => {
    const response = await tripApi.put(`/${tripId}/status`, { status });
    return response.data;
};

// Delete trip (via BFF)
export const deleteTrip = async (tripId: number): Promise<void> => {
    await tripApi.delete(`/${tripId}`);
};

// Add booking to trip
export const addBookingToTrip = async (tripId: number, bookingData: {
    bookingType: 'BUS' | 'HOTEL' | 'EVENT';
    bookingId: number;
    bookingReference: string;
    amount: number;
}): Promise<void> => {
    await tripApi.post(`/${tripId}/bookings`, {
        ...bookingData,
        bookingDate: new Date().toISOString(),
        status: 'CONFIRMED'
    });
};

// Get trip bookings (via BFF)
export const getTripBookings = async (tripId: number): Promise<any[]> => {
    const response = await tripApi.get(`/${tripId}/bookings`);
    return response.data;
};

// Get full itinerary (Trip + Days + Journeys)
export const getTripFullItinerary = async (tripId: number): Promise<any> => {
    const response = await tripApi.get(`/${tripId}/itinerary`);
    return response.data;
};

// Initialize itinerary days
export const initializeItinerary = async (tripId: number): Promise<void> => {
    await tripApi.post(`/${tripId}/itinerary/initialize`);
};

// Generate journey for trip
export const generateJourney = async (tripId: number, userId: number): Promise<any> => {
    const response = await tripApi.post(`/${tripId}/journeys/generate`, null, {
        params: { tripId, userId } // Redundant but harmless, some proxies might use params
    });
    return response.data;
};

// Add checkpoint to journey
export const addCheckpoint = async (journeyId: number, checkpoint: any): Promise<any> => {
    const response = await tripApi.post(`/journeys/${journeyId}/checkpoints`, checkpoint);
    return response.data;
};

// Delete checkpoint from journey
export const deleteCheckpoint = async (journeyId: number, checkpointId: number): Promise<void> => {
    await tripApi.delete(`/journeys/${journeyId}/checkpoints/${checkpointId}`);
};

// Update checkpoint
export const updateCheckpoint = async (journeyId: number, checkpointId: number, checkpoint: any): Promise<any> => {
    const response = await tripApi.put(`/journeys/${journeyId}/checkpoints/${checkpointId}`, checkpoint);
    return response.data;
};

export default {
    getTripDashboard,
    getMyTrips,
    getMyTripsByStatus,
    createTrip,
    getTripById,
    getTripDetails,
    updateTrip,
    updateTripStatus,
    deleteTrip,
    addBookingToTrip,
    getTripBookings,
    getTripFullItinerary,
    initializeItinerary,
    generateJourney,
    addCheckpoint,
    deleteCheckpoint,
    updateCheckpoint
};
