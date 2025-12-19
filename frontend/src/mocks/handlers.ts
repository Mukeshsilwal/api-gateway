/**
 * MSW Mock Handlers
 * Mock API responses for development and testing
 */

import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

export const handlers = [
    // Auth - Login
    http.post(`${BASE_URL}/bff/v1/auth/login`, () => {
        return HttpResponse.json({
            code: 200,
            message: 'Login successful',
            data: {
                authData: {
                    accessToken: 'mock-access-token',
                    refreshToken: 'mock-refresh-token',
                    sessionId: 'mock-session-id',
                    roles: ['USER'],
                    expiresIn: 3600,
                },
                userProfile: {
                    id: 1,
                    email: 'test@example.com',
                    fullName: 'Test User',
                    roles: ['USER'],
                    createdAt: new Date().toISOString(),
                },
                userPreferences: {},
            },
        });
    }),

    // Auth - Dashboard
    http.get(`${BASE_URL}/bff/v1/auth/dashboard`, () => {
        return HttpResponse.json({
            code: 200,
            message: 'Dashboard retrieved',
            data: {
                userProfile: {
                    id: 1,
                    email: 'test@example.com',
                    fullName: 'Test User',
                    roles: ['USER'],
                    createdAt: new Date().toISOString(),
                },
                bookingSummary: {
                    totalBookings: 5,
                    activeBookings: 2,
                    completedBookings: 3,
                    cancelledBookings: 0,
                },
                activeSessions: [
                    {
                        sessionId: 'mock-session-id',
                        ipAddress: '192.168.1.1',
                        userAgent: 'Mozilla/5.0',
                        loginTime: new Date().toISOString(),
                        lastActivity: new Date().toISOString(),
                        current: true,
                    },
                ],
                recentActivity: [],
            },
        });
    }),

    // Hotel - Search
    http.post(`${BASE_URL}/bff/v1/hotels/search`, () => {
        return HttpResponse.json({
            code: 200,
            message: 'Search results',
            data: {
                hotels: [
                    {
                        id: 1,
                        name: 'Grand Plaza Hotel',
                        code: 'GPH001',
                        address: '123 Main St',
                        city: 'Kathmandu',
                        country: 'Nepal',
                        phone: '+977-1-4444444',
                        email: 'info@grandplaza.com',
                        amenities: ['WiFi', 'Pool', 'Gym'],
                        starRating: 5,
                        images: ['https://via.placeholder.com/400'],
                        averageRating: 4.5,
                        totalReviews: 120,
                        createdAt: new Date().toISOString(),
                    },
                ],
                totalResults: 1,
                page: 1,
                pageSize: 10,
            },
        });
    }),

    // Bookings - User Bookings
    http.get(`${BASE_URL}/bff/v1/booking/user/:userId`, () => {
        return HttpResponse.json({
            code: 200,
            message: 'Bookings retrieved',
            data: [
                {
                    id: 1,
                    userId: 1,
                    bookingType: 'HOTEL',
                    referenceId: 1,
                    status: 'CONFIRMED',
                    totalAmount: 300,
                    currency: 'USD',
                    bookingDate: new Date().toISOString(),
                },
            ],
        });
    }),
];
