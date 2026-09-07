import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../../pages/Dashboard';
import { authApi } from '../../api/endpoints/auth.api';
import { bookingApi } from '../../api/endpoints/booking.api';

// Mock APIs
vi.mock('../../api/endpoints/auth.api', () => ({
    authApi: {
        getDashboard: vi.fn(),
    }
}));

vi.mock('../../api/endpoints/booking.api', () => ({
    bookingApi: {
        getUserBookings: vi.fn(),
    }
}));

// Mock Cart Integration and Theme
vi.mock('../../hooks/useUnifiedBookingCart', () => ({
    useUnifiedBookingCart: () => ({
        itemCount: 0,
        totalAmount: 0,
        cartItems: [],
        items: [],
        removeFromCart: vi.fn(),
        clearCart: vi.fn(),
    })
}));

vi.mock('../../context/ThemeContext', () => ({
    useTheme: () => ({
        theme: 'light',
        isDark: false,
        toggleTheme: vi.fn(),
    })
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: any) => (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </QueryClientProvider>
    );
};

describe('User Dashboard Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('userData', JSON.stringify({
            id: 5,
            email: 'admin@ticketkatum.com',
            firstName: 'Super',
            lastName: 'Admin'
        }));
        localStorage.setItem('token', 'mock-token');
    });

    it('renders user greeting and dashboard statistics when data is fetched', async () => {
        const mockDashboardData = {
            user: {
                id: 5,
                firstName: 'Super',
                lastName: 'Admin',
                email: 'admin@ticketkatum.com',
                roles: ['SUPER_ADMIN', 'USER']
            },
            userProfile: {
                id: 5,
                firstName: 'Super',
                lastName: 'Admin',
                fullName: 'Super Admin',
                email: 'admin@ticketkatum.com',
                roles: ['SUPER_ADMIN', 'USER']
            },
            statistics: {
                totalBookings: 12,
                upcomingBookings: 3,
                completedBookings: 8,
                cancelledBookings: 1,
                totalSpent: 45000,
                loyaltyPoints: 150
            },
            bookingSummary: {
                totalBookings: 12,
                activeBookings: 3,
                completedBookings: 8,
                cancelledBookings: 1
            },
            recentBookings: [
                {
                    id: 101,
                    bookingType: 'BUS',
                    status: 'CONFIRMED',
                    totalAmount: 2500,
                    currency: 'NPR',
                    bookingDate: '2026-09-01T10:00:00Z'
                }
            ],
            activeSessions: [
                {
                    sessionId: 'sess-123',
                    ipAddress: '127.0.0.1',
                    userAgent: 'Mozilla/5.0 Chrome',
                    lastActivity: '2026-09-05T12:00:00Z',
                    current: true
                }
            ]
        };

        (authApi.getDashboard as any).mockResolvedValue(mockDashboardData);
        (bookingApi.getUserBookings as any).mockResolvedValue(mockDashboardData.recentBookings);

        render(<Dashboard />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(screen.getByText(/Welcome back, Super Admin!/i)).toBeInTheDocument();
            expect(screen.getByText('12')).toBeInTheDocument();
            expect(screen.getByText('3')).toBeInTheDocument();
            expect(screen.getByText('8')).toBeInTheDocument();
            expect(screen.getByText(/Rs. 45,000/i)).toBeInTheDocument();
        });
    });

    it('renders gracefully with zero counts and empty booking list without throwing', async () => {
        const mockEmptyDashboard = {
            user: {
                id: 5,
                email: 'solo@example.com'
            },
            userProfile: {
                id: 5,
                fullName: 'solo@example.com',
                email: 'solo@example.com'
            },
            statistics: {
                totalBookings: 0,
                upcomingBookings: 0,
                completedBookings: 0,
                cancelledBookings: 0,
                totalSpent: 0,
                loyaltyPoints: 0
            },
            bookingSummary: {
                totalBookings: 0,
                activeBookings: 0,
                completedBookings: 0,
                cancelledBookings: 0
            },
            recentBookings: [],
            activeSessions: []
        };

        (authApi.getDashboard as any).mockResolvedValue(mockEmptyDashboard);
        (bookingApi.getUserBookings as any).mockResolvedValue([]);

        render(<Dashboard />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(screen.getByText(/Welcome back, solo@example.com!/i)).toBeInTheDocument();
            expect(screen.getByText('No bookings yet')).toBeInTheDocument();
        });
    });
});
