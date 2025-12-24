import api from './api';

// ==================== TYPES ====================

export interface CreateListingRequest {
    originalTicketId: number;
    sellerUserId: number;
    eventId: number;
    resalePrice: number;
}

export interface PurchaseRequest {
    buyerUserId: number;
}

export interface ResaleListing {
    id: number;
    originalTicketId: number;
    sellerUserId: number;
    eventId: number;
    status: 'ACTIVE' | 'SOLD' | 'EXPIRED' | 'CANCELLED';
    faceValue: number;
    resalePrice: number;
    commissionFee: number;
    expiresAt: string;
    createdAt: string;
}

export interface ResaleTransaction {
    id: number;
    listingId: number;
    buyerUserId: number;
    sellerUserId: number;
    finalPrice: number;
    payoutAmount: number;
    transactionDate: string;
}

export interface BundleBookingRequest {
    userId: string;
    contactDetails: {
        name: string;
        email: string;
        phone: string;
    };
    paymentDetails: {
        method: string;
        cardNumber?: string;
    };
}

export interface Bundle {
    id: number;
    name: string;
    description: string;
    totalPrice: number;
    discountPercentage: number;
    active: boolean;
    items: BundleItem[];
}

export interface BundleItem {
    id: number;
    itemType: 'HOTEL' | 'BUS' | 'EVENT';
    itemReferenceId: string;
    subReferenceId?: string;
    quantity: number;
}

export interface LoyaltyProfile {
    userId: number;
    pointsBalance: number;
    lifetimePoints: number;
    tierLevel: 'BRONZE' | 'SILVER' | 'GOLD';
}

export interface PointTransaction {
    id: number;
    userId: number;
    amount: number;
    source: string;
    description: string;
    createdAt: string;
}

export interface Product {
    id: number;
    eventId: number;
    name: string;
    price: number;
    type: 'F_AND_B' | 'MERCH';
    imageUrl?: string;
    available: boolean;
}

export interface OrderRequest {
    userId: number;
    productId: number;
    seatLocation: string;
}

export interface LivePoll {
    id: number;
    eventId: number;
    question: string;
    options: string[];
    voteCounts: Record<string, number>;
    status: 'ACTIVE' | 'CLOSED';
}

export interface VoteRequest {
    pollId: number;
    selectedOption: string;
}

export interface CrowdZone {
    id: number;
    eventId: number;
    zoneName: string;
    capacity: number;
    currentCount: number;
    status: 'NORMAL' | 'MODERATE' | 'CROWDED' | 'FULL';
    lastUpdated: string;
}

export interface PriceCalculation {
    itemId: string;
    originalPrice: number;
    currentPrice: number;
    isSurge: boolean;
}

export interface EventAnalytics {
    eventId: number;
    totalRevenue: number;
    resaleActivity: number;
    bundlesSold: number;
    loyaltyEngagement: number;
    fbRevenue: number;
}

// ==================== API CLIENT ====================

export const marketService = {
    // ========== RESALE MARKETPLACE ==========

    /**
     * Get all active resale listings for an event
     */
    getResaleListings: (eventId: number) =>
        api.get<ResaleListing[]>(`/api/bff/market/resale/list?eventId=${eventId}`),

    /**
     * Create a new resale listing
     */
    createListing: (data: CreateListingRequest) =>
        api.post<ResaleListing>('/api/bff/market/resale', data),

    /**
     * Purchase a resale listing
     */
    buyListing: (listingId: string, data: PurchaseRequest) =>
        api.post<ResaleTransaction>(`/api/bff/market/resale/${listingId}/buy`, data),

    // ========== BUNDLES ==========

    /**
     * Get all active bundle packages
     */
    getBundles: () =>
        api.get<Bundle[]>('/api/bff/market/bundles'),

    /**
     * Book a bundle package
     */
    bookBundle: (bundleId: string, data: BundleBookingRequest) =>
        api.post<string>(`/api/bff/market/bundles/${bundleId}/book`, data),

    // ========== LOYALTY PROGRAM ==========

    /**
     * Get user's loyalty profile
     */
    getLoyaltyProfile: (userId: string) =>
        api.get<LoyaltyProfile>(`/api/bff/market/loyalty/${userId}`),

    /**
     * Get user's points transaction history
     */
    getLoyaltyHistory: (userId: string) =>
        api.get<PointTransaction[]>(`/api/bff/market/loyalty/${userId}/history`),

    // ========== DYNAMIC PRICING ==========

    /**
     * Calculate dynamic price for an item
     */
    calculatePrice: (eventId: string, basePrice: number) =>
        api.get<PriceCalculation>(`/api/bff/market/pricing?eventId=${eventId}&basePrice=${basePrice}`),

    // ========== CROWD FLOW ==========

    /**
     * Get real-time crowd heatmap for an event
     */
    getHeatmap: (eventId: string) =>
        api.get<CrowdZone[]>(`/api/bff/market/crowd/heatmap/${eventId}`),

    // ========== LIVE INTERACTIONS ==========

    /**
     * Get active polls for an event
     */
    getPolls: (eventId: string) =>
        api.get<LivePoll[]>(`/api/bff/market/live/polls/${eventId}`),

    /**
     * Cast a vote on a poll
     */
    vote: (data: VoteRequest) =>
        api.post<void>('/api/bff/market/live/vote', data),

    /**
     * Get F&B menu for an event
     */
    getMenu: (eventId: string) =>
        api.get<Product[]>(`/api/bff/market/live/menu/${eventId}`),

    /**
     * Order a product (F&B or merchandise)
     */
    orderProduct: (data: OrderRequest) =>
        api.post<void>('/api/bff/market/live/order', data),

    // ========== ORGANIZER ANALYTICS ==========

    /**
     * Get market analytics for event organizers
     */
    getOrganizerAnalytics: (eventId: string) =>
        api.get<EventAnalytics>(`/api/bff/market/organizer/dashboard/${eventId}`),
};

export default marketService;
