/**
 * Core DTO Type Definitions
 * Auto-generated from backend DTOs for type-safe frontend development
 * 
 * @see Backend DTOs in web-bff/src/main/java/com/ticketkatum/dto
 */

// ============================================================
// AUTHENTICATION & USER MANAGEMENT
// ============================================================

export interface UserDto {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    role: string;
    organizationName?: string;
    enabled: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
}

export interface AdminRegistrationRequestDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    requestReason: string;
    department?: string;
}

// ============================================================
// BUS BOOKING SYSTEM
// ============================================================

export interface BusDto {
    routeId: number;
    busName: string;
    busType: string;
    departureDateTime: string; // ISO 8601 format
    basePrice: number;
    maxPrice: number;
    date: string; // ISO 8601 date format
    seats?: SeatDto[];
    routeDto?: RouteDto;
    numberOfSeats: number;
}

export interface SeatDto {
    busId: number;
    busName: string;
    reserved: boolean; // Deprecated, use status
    status: SeatStatus;
    holdExpiresAt: string; // ISO 8601 format
    seatNumber: string;
    price: number;
}

export type SeatStatus = 'AVAILABLE' | 'HELD' | 'BOOKED';

export interface RouteDto {
    id: number;
    origin: string;
    destination: string;
    distance?: number;
    estimatedDuration?: number;
}

export interface BookingRequestDto {
    busId: number;
    seatIds: number[];
    passengerDetails: PassengerDetail[];
    travelDate: string;
    contactEmail: string;
    contactPhone: string;
}

export interface PassengerDetail {
    firstName: string;
    lastName: string;
    age?: number;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    seatNumber: string;
}

export interface BookingTicketDto {
    id: number;
    bookingReference: string;
    busName: string;
    route: string;
    departureTime: string;
    seatNumbers: string[];
    passengerName: string;
    totalAmount: number;
    status: BookingStatus;
    qrCode?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

// ============================================================
// HOTEL BOOKING SYSTEM
// ============================================================

export interface HotelDto {
    id: number;
    hotelCode: string;
    name: string;
    description?: string;
    address: string;
    city: string;
    country: string;
    rating?: number;
    images: string[];
    amenities: string[];
    startingPrice: number;
    availableRooms?: number;
    totalRooms?: number;
    latitude?: number;
    longitude?: number;
}

export interface AvailableRoomDto {
    roomId: number;
    roomNumber: string;
    roomType: string;
    basePrice: number;
    availableCount: number;
    amenities: string[];
    images: string[];
    maxOccupancy: number;
    bedType?: string;
    // Status Fields
    status?: string; // e.g., 'Available', 'Occupied'
    roomStatus?: string; // Alias for status
    cleaningStatus?: string; // 'Pending', 'In Progress', 'Completed'
    maintenanceStatus?: string; // 'None', 'Reported', 'In Progress'
}

export interface AvailabilityRequestDto {
    hotelId: number;
    roomType?: string; // Optional filter by room type
    checkIn: string; // ISO 8601 date
    checkOut: string; // ISO 8601 date
    guestsCount: number; // Changed from 'guests' to match backend
}

export interface PricingRequestDto {
    roomId: number;
    rentTypeId: number; // Changed from rentType enum to ID
    mealPlanId: number; // Changed from mealPlan enum to ID
    checkIn: string;
    checkOut: string;
}

export interface PricingResponseDto {
    roomId: number;
    totalPrice: number;
    breakdown: PriceBreakdown;
    rentTypeId: number;
    mealPlanId: number;
    taxAmount: number;
    discounts?: Discount[];
}

export interface PriceBreakdown {
    basePrice: number;
    mealCost: number;
    serviceFee: number;
    taxes: number;
    total: number;
}

export interface Discount {
    code: string;
    amount: number;
    type: 'PERCENTAGE' | 'FIXED';
}

// Rent Type and Meal Plan Enums (for display purposes)
export type RentType = 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type MealPlan = 'NO_MEAL' | 'BREAKFAST' | 'HALF_BOARD' | 'FULL_BOARD' | 'ALL_INCLUSIVE';

// ID Mappings for backend communication
export const RENT_TYPE_IDS: Record<RentType, number> = {
    'HOURLY': 1,
    'DAILY': 2,
    'WEEKLY': 3,
    'MONTHLY': 4,
};

export const MEAL_PLAN_IDS: Record<MealPlan, number> = {
    'NO_MEAL': 1,
    'BREAKFAST': 2,
    'HALF_BOARD': 3,
    'FULL_BOARD': 4,
    'ALL_INCLUSIVE': 5,
};

export interface HotelBookingRequestDto {
    hotelId: number;
    roomId: number;
    checkIn: string;
    checkOut: string;
    guests: number;
    guestDetails: GuestDetail[];
    rentTypeId: number; // Changed from rentType enum
    mealPlanId: number; // Changed from mealPlan enum
    specialRequests?: string;
}

export interface GuestDetail {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    idType?: string;
    idNumber?: string;
}

export interface BookingResponseDto {
    bookingReference: string;
    status: BookingStatus;
    hotelName: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    confirmationEmail?: string;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

// ============================================================
// PAYMENT PROCESSING
// ============================================================

export interface PaymentRequestDto {
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    bookingReference: string;
    returnUrl: string;
    cancelUrl?: string;
}

export type PaymentMethod = 'ESEWA' | 'KHALTI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER';

export interface PaymentResponseDto {
    transactionId: string;
    status: PaymentStatus;
    paymentUrl?: string;
    expiresAt?: string;
    qrCode?: string;
    message?: string;
}

// ============================================================
// AI CHATBOT
// ============================================================

export interface ChatRequest {
    message: string;
}

export interface ChatResponse {
    message: string;
    suggestions: string[];
    conversationId?: string;
    error: boolean;
}

// ============================================================
// AGGREGATED RESPONSES (BFF-Specific)
// ============================================================

export interface AggregatedHotelDetails {
    hotel: HotelDto;
    rooms: AvailableRoomDto[];
    nearbyAttractions?: string[];
    reviews?: Review[];
}

export interface Review {
    id: number;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

export interface AggregatedSearchResults {
    hotels: HotelDto[];
    buses: BusDto[];
    totalResults: number;
    filters?: SearchFilters;
}

export interface SearchFilters {
    priceRange?: [number, number];
    rating?: number;
    amenities?: string[];
    busType?: string;
}

export interface AggregatedUserDashboard {
    user: UserDto;
    recentBookings: BookingTicketDto[];
    recommendations: Recommendation[];
    stats?: UserStats;
}

export interface Recommendation {
    type: 'HOTEL' | 'BUS' | 'PACKAGE';
    id: number;
    title: string;
    description: string;
    price: number;
    image?: string;
}

export interface UserStats {
    totalBookings: number;
    totalSpent: number;
    favoriteDestinations: string[];
}

export interface HomePageData {
    featuredHotels: HotelDto[];
    popularRoutes: RouteDto[];
    announcements: Announcement[];
    banners?: Banner[];
}

export interface Announcement {
    id: number;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS';
    expiresAt?: string;
}

export interface Banner {
    id: number;
    image: string;
    title: string;
    link?: string;
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================

export interface DashboardSummaryDto {
    totalBookings: number;
    totalRevenue: number;
    activeUsers: number;
    revenueByMonth: MonthlyRevenue[];
    bookingsByDay: DailyBooking[];
    popularRoutes: PopularRoute[];
    topHotels: TopHotel[];
}

export interface MonthlyRevenue {
    month: string;
    revenue: number;
}

export interface DailyBooking {
    date: string;
    count: number;
}

export interface PopularRoute {
    route: string;
    bookings: number;
}

export interface TopHotel {
    hotelName: string;
    bookings: number;
    revenue: number;
}

// ============================================================
// COMMON RESPONSE WRAPPER
// ============================================================

export interface Response<T> {
    statusCode: number;
    message: string;
    data?: T;
    timestamp?: string;
    correlationId?: string;
}

// ============================================================
// UTILITY TYPES
// ============================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Pagination
export interface PageRequest {
    page: number;
    size: number;
    sort?: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
}

// Error handling
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
}
