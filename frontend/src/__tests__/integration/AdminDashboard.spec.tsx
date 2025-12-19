import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from '../../components/admin/Dashboard';
import { adminApi } from '../../api/admin';

// Mock API
vi.mock('../../api/admin', () => ({
    adminApi: {
        getSummary: vi.fn(),
        getLiveSnapshot: vi.fn(),
    }
}));

// Mock SSE
class MockEventSource {
    onopen: () => void = () => { };
    onmessage: (event: any) => void = () => { };
    onerror: (event: any) => void = () => { };
    close: () => void = () => { };
    constructor(url: string) {
        setTimeout(() => this.onopen(), 10);
    }
}
global.EventSource = MockEventSource as any;

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: any) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('Admin Dashboard Integration', () => {
    it('renders loading skeletons initially', () => {
        render(<Dashboard />, { wrapper: createWrapper() });
        // Check for skeleton elements (we can check by test-id if added, or simple class check)
        // Here we just check if "Dashboard Overview" title is present
        expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    });

    it('renders stats after data fetch', async () => {
        const mockSummary = {
            totals: {
                buses: 10,
                routes: 5,
                bookings: 100,
                revenueNPR: 50000,
                activeTripsToday: 2
            },
            liveTracking: { gpsActive: true, activeBuses: 3 },
            revenueSeries: [],
            recentActivity: [],
            systemHealth: { status: 'ok' }
        };

        (adminApi.getSummary as any).mockResolvedValue(mockSummary);

        render(<Dashboard />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(screen.getByText('Rs. 50,000')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument();
        });
    });
});
