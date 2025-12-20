/**
 * Event Management DTO Type Definitions
 * TypeScript interfaces for event onboarding and management
 */

// ============================================================
// ORGANIZER MANAGEMENT
// ============================================================

export interface OrganizerRegistrationDto {
    email: string;
    phone: string;
    password: string;
    organizationName: string;
    organizationType: OrganizationType;
    businessLicense?: string;
    taxId?: string;
    address: AddressDto;
    bankDetails: BankAccountDto;
}

export type OrganizationType = 'INDIVIDUAL' | 'COMPANY' | 'NGO' | 'GOVERNMENT';

export interface OrganizerProfileDto {
    id: number;
    userId: number;
    organizationName: string;
    organizationType: OrganizationType;
    logo?: string;
    description: string;
    website?: string;
    socialMedia: SocialMediaLinks;
    verificationStatus: VerificationStatus;
    verifiedAt?: string;
    rating?: number;
    totalEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    createdAt: string;
    updatedAt: string;
}

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export interface SocialMediaLinks {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
}

export interface BankAccountDto {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    routingNumber?: string;
    swiftCode?: string;
    accountType: 'SAVINGS' | 'CHECKING' | 'BUSINESS';
}

export interface AddressDto {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
}

// ============================================================
// EVENT MANAGEMENT
// ============================================================

export interface EventCreationDto {
    basicInfo: EventBasicInfoDto;
    ticketing: EventTicketingDto;
    additionalDetails: EventDetailsDto;
    paymentSettings: EventPaymentDto;
    status: EventStatus;
}

export type EventStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

export interface EventBasicInfoDto {
    name: string;
    slug?: string;
    category: EventCategory;
    type: EventType;
    startDateTime: string;
    endDateTime: string;
    timezone: string;
    venue?: VenueDto;
    onlineLink?: string;
    description: string;
    shortDescription?: string;
    coverImage: string;
    images: string[];
    tags: string[];
    language: string;
}

export type EventCategory =
    | 'MUSIC'
    | 'SPORTS'
    | 'CONFERENCE'
    | 'WORKSHOP'
    | 'FESTIVAL'
    | 'EXHIBITION'
    | 'THEATER'
    | 'COMEDY'
    | 'NETWORKING'
    | 'OTHER';

export type EventType = 'ONLINE' | 'OFFLINE' | 'HYBRID';

export interface VenueDto {
    id?: number;
    name: string;
    address: AddressDto;
    capacity?: number;
    amenities?: string[];
    parkingInfo?: string;
    accessibilityInfo?: string;
}

export interface EventTicketingDto {
    ticketTypes: TicketTypeDto[];
    salesStartDate: string;
    salesEndDate: string;
    maxTicketsPerOrder: number;
    minTicketsPerOrder: number;
    allowWaitlist: boolean;
    requireApproval: boolean;
}

export interface TicketTypeDto {
    id?: number;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    quantitySold?: number;
    availableFrom?: string;
    availableTo?: string;
    benefits?: string[];
    color?: string;
    sortOrder: number;
    isActive: boolean;
}

export interface EventDetailsDto {
    ageRestriction?: number;
    dressCode?: string;
    parkingInfo?: string;
    accessibilityFeatures?: string[];
    whatToBring?: string[];
    prohibitedItems?: string[];
    termsAndConditions?: string;
    refundPolicy?: string;
    faq?: FAQItem[];
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface EventPaymentDto {
    paymentGateways: PaymentGateway[];
    platformFeePercentage: number;
    organizerPayoutSchedule: PayoutSchedule;
    refundPolicy: RefundPolicy;
    taxRate?: number;
}

export type PaymentGateway = 'ESEWA' | 'KHALTI' | 'STRIPE' | 'PAYPAL' | 'BANK_TRANSFER';
export type PayoutSchedule = 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'AFTER_EVENT';
export type RefundPolicy = 'NO_REFUND' | 'PARTIAL_REFUND' | 'FULL_REFUND' | 'CUSTOM';

// ============================================================
// EVENT DISPLAY
// ============================================================

export interface EventDto {
    id: number;
    organizerId: number;
    organizerName: string;
    organizerLogo?: string;
    basicInfo: EventBasicInfoDto;
    ticketing: EventTicketingDto;
    additionalDetails: EventDetailsDto;
    status: EventStatus;
    totalTickets: number;
    ticketsSold: number;
    ticketsAvailable: number;
    revenue: number;
    views: number;
    likes: number;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}

export interface EventCardDto {
    id: number;
    name: string;
    slug: string;
    category: EventCategory;
    type: EventType;
    startDateTime: string;
    coverImage: string;
    organizerName: string;
    venueName?: string;
    city?: string;
    minPrice: number;
    maxPrice: number;
    ticketsAvailable: number;
    isFeatured: boolean;
    rating?: number;
}

// ============================================================
// TICKET BOOKING
// ============================================================

export interface TicketBookingDto {
    eventId: number;
    tickets: TicketSelectionDto[];
    attendees: AttendeeDto[];
    contactEmail: string;
    contactPhone: string;
    specialRequests?: string;
    promoCode?: string;
}

export interface TicketSelectionDto {
    ticketTypeId: number;
    quantity: number;
}

export interface AttendeeDto {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    ticketTypeId: number;
    additionalInfo?: Record<string, any>;
}

export interface EventBookingResponseDto {
    bookingReference: string;
    eventId: number;
    eventName: string;
    startDateTime: string;
    venue?: string;
    tickets: BookedTicketDto[];
    totalAmount: number;
    platformFee: number;
    tax: number;
    grandTotal: number;
    paymentStatus: PaymentStatus;
    qrCodes: string[];
    confirmationEmail: string;
}

export interface BookedTicketDto {
    ticketId: string;
    ticketType: string;
    attendeeName: string;
    price: number;
    qrCode: string;
    status: TicketStatus;
}

export type TicketStatus = 'ACTIVE' | 'CHECKED_IN' | 'CANCELLED' | 'REFUNDED';

// ============================================================
// ANALYTICS & REPORTING
// ============================================================

export interface EventAnalyticsDto {
    eventId: number;
    overview: AnalyticsOverview;
    salesByTicketType: SalesByTicketType[];
    salesOverTime: SalesDataPoint[];
    attendeeDemographics: Demographics;
    trafficSources: TrafficSource[];
    conversionRate: number;
}

export interface AnalyticsOverview {
    totalTicketsSold: number;
    totalRevenue: number;
    averageTicketPrice: number;
    totalViews: number;
    totalLikes: number;
    checkInRate: number;
}

export interface SalesByTicketType {
    ticketTypeName: string;
    quantitySold: number;
    revenue: number;
    percentage: number;
}

export interface SalesDataPoint {
    date: string;
    ticketsSold: number;
    revenue: number;
}

export interface Demographics {
    ageGroups: { range: string; count: number }[];
    genderDistribution: { gender: string; count: number }[];
    locationDistribution: { city: string; count: number }[];
}

export interface TrafficSource {
    source: string;
    visits: number;
    conversions: number;
    conversionRate: number;
}

// ============================================================
// ORGANIZER DASHBOARD
// ============================================================

export interface OrganizerDashboardDto {
    organizer: OrganizerProfileDto;
    upcomingEvents: EventCardDto[];
    pastEvents: EventCardDto[];
    draftEvents: EventCardDto[];
    totalRevenue: number;
    totalTicketsSold: number;
    recentBookings: RecentBookingDto[];
    notifications: NotificationDto[];
}

export interface RecentBookingDto {
    bookingReference: string;
    eventName: string;
    attendeeName: string;
    ticketType: string;
    amount: number;
    bookedAt: string;
    status: PaymentStatus;
}

export interface NotificationDto {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    actionUrl?: string;
}

export type NotificationType =
    | 'BOOKING'
    | 'PAYMENT'
    | 'REFUND'
    | 'EVENT_APPROVED'
    | 'EVENT_REJECTED'
    | 'REVIEW'
    | 'SYSTEM';

// ============================================================
// DISCOUNT & PROMO CODES
// ============================================================

export interface PromoCodeDto {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    maxUses: number;
    usedCount: number;
    validFrom: string;
    validTo: string;
    applicableTicketTypes?: number[];
    minPurchaseAmount?: number;
    isActive: boolean;
}

// ============================================================
// CHECK-IN SYSTEM
// ============================================================

export interface CheckInDto {
    ticketId: string;
    qrCode: string;
    checkInTime: string;
    checkInLocation?: string;
    checkedInBy: string;
}

export interface CheckInResponseDto {
    success: boolean;
    ticketId: string;
    attendeeName: string;
    ticketType: string;
    eventName: string;
    alreadyCheckedIn: boolean;
    checkInTime?: string;
    message: string;
}

// ============================================================
// COMMUNICATION
// ============================================================

export interface EventAnnouncementDto {
    eventId: number;
    subject: string;
    message: string;
    sendEmail: boolean;
    sendSMS: boolean;
    sendPush: boolean;
    targetAudience: 'ALL' | 'TICKET_HOLDERS' | 'SPECIFIC_TICKET_TYPE';
    ticketTypeIds?: number[];
}

export interface EmailTemplateDto {
    type: EmailType;
    subject: string;
    htmlContent: string;
    variables: string[];
}

export type EmailType =
    | 'BOOKING_CONFIRMATION'
    | 'PAYMENT_RECEIPT'
    | 'EVENT_REMINDER'
    | 'EVENT_UPDATE'
    | 'REFUND_CONFIRMATION'
    | 'EVENT_CANCELLED';
