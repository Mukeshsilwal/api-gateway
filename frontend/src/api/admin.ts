import client from './client';

// === Types ===
interface BffResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export type AdminSummary = {
    totals: {
        buses: number;
        routes: number;
        bookings: number;
        revenueNPR: number;
        hotels: number;
        movies: number;
        activeTripsToday: number;
    };
    liveTracking: {
        gpsActive: boolean;
        activeBuses: number;
    };
    revenueSeries: Array<{ date: string; amountNPR: number }>;
    recentActivity: Array<{
        id: string;
        type: 'bus' | 'route' | 'booking' | 'ticket' | 'hotel' | 'movie';
        title: string;
        ts: string;
    }>;
    systemHealth: { status: 'ok' | 'degraded' | 'down'; lastCheckTs: string };
};

export type BusLocation = {
    id: string;
    lat: number;
    lng: number;
    speedKmph: number;
};

export type LiveSnapshot = {
    activeBuses: number;
    buses: BusLocation[];
};

export type SearchResultItem = {
    id: string;
    entity: 'bus' | 'route' | 'ticket';
    title: string;
    subtitle?: string;
};

// === API Methods ===

export const adminApi = {
    /**
     * Get aggregated admin dashboard summary.
     * Supports ETag via If-None-Match header in the calling layer (React Query).
     */
    getSummary: async (window: '7d' | '30d' | '90d' = '30d', tz: string = 'Asia/Kathmandu'): Promise<AdminSummary> => {
        const response = await client.get<BffResponse<AdminSummary>>('/api/bff/v1/admin/summary', {
            params: { window, tz }
        });
        return response.data.data;
    },

    /**
     * Fallback polling endpoint for live bus locations.
     */
    getLiveSnapshot: async (tz: string = 'Asia/Kathmandu'): Promise<LiveSnapshot> => {
        const response = await client.get<BffResponse<LiveSnapshot>>('/api/bff/v1/admin/live/buses/snapshot', {
            params: { tz }
        });
        return response.data.data;
    },

    /**
     * Global search across entities.
     */
    searchEntities: async (query: string, signal?: AbortSignal): Promise<SearchResultItem[]> => {
        const response = await client.get<{ items: SearchResultItem[] }>('/search', {
            params: { q: query, entities: 'buses,routes,tickets', limit: 10 },
            signal
        });
        return response.data.items;
    },

    getAuditSnapshot: async (limit: number = 20) => {
        const response = await client.get('/audit/snapshot', { params: { limit } });
        return response.data;
    },

    getSystemHealth: async () => {
        const response = await client.get('/system/health');
        return response.data;
    }
};
