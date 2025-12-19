/**
 * Hotel API Type Definitions
 */

export interface HotelDto {
    id: number;
    name: string;
    code: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    description?: string;
    amenities: string[];
    starRating: number;
    images: string[];
    averageRating?: number;
    totalReviews?: number;
    createdAt: string;
}

export interface RoomDto {
    id: number;
    hotelId: number;
    roomNumber: string;
    roomType: string;
    capacity: number;
    basePrice: number;
    amenities: string[];
    images: string[];
    isAvailable: boolean;
}

export interface HotelSearchRequest {
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
}

export interface HotelSearchResponse {
    hotels: HotelDto[];
    totalResults: number;
    page: number;
    pageSize: number;
}

export interface AvailabilityResponse {
    available: boolean;
    roomId: number;
    hotelId: number;
    message?: string;
}

export interface PriceCalculationResponse {
    totalPrice: number;
    basePrice: number;
    taxes: number;
    serviceFee: number;
    currency: string;
    breakdown: Array<{ description: string; amount: number }>;
}

export interface RoomLockResponse {
    lockId: string;
    roomId: number;
    hotelId: number;
    expiresAt: string;
    totalPrice: number;
    currency: string;
}
