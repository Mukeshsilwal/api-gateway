import { describe, it, expect, vi, beforeEach } from 'vitest';
import eventService from '../eventService';
import apiClient from '../../config/apiConfig';

vi.mock('../../config/apiConfig', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
    API_ENDPOINTS: {
        EVENTS: {
            LIST: '/api/events',
            SEARCH: '/api/events/search',
            DETAILS: (id) => `/api/events/${id}`,
            CATEGORIES: '/api/events/categories',
            UPCOMING: '/api/events/upcoming',
            TICKET_TIERS: (id) => `/api/events/${id}/ticket-tiers`,
            SEAT_LAYOUT: (id) => `/api/events/${id}/seat-layout`,
            BOOKINGS: (id) => `/api/events/${id}/bookings`
        },
        ADMIN: {
            EVENTS: {
                SEARCH: '/api/admin/events/search',
                PUBLISH: (id) => `/api/admin/events/${id}/publish`,
                CANCEL: (id) => `/api/admin/events/${id}/cancel`,
                ANALYTICS: (id) => `/api/admin/events/${id}/analytics`,
                ORGANIZER_EVENTS: (id) => `/api/admin/organizers/${id}/events`
            }
        }
    }
}));

describe('EventService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('User Event Discovery & Ticketing', () => {
        it('fetches published event list with pagination', async () => {
            const mockEvents = {
                data: {
                    content: [
                        { id: 1, title: 'Kathmandu Music Fest', category: 'MUSIC', date: '2026-10-15' },
                        { id: 2, title: 'Himalayan Tech Summit', category: 'TECH', date: '2026-11-20' }
                    ],
                    totalElements: 2
                }
            };

            apiClient.get.mockResolvedValueOnce(mockEvents);

            const result = await eventService.getEvents({ page: 0, size: 10 });

            expect(apiClient.get).toHaveBeenCalledWith(
                '/api/events',
                { params: { page: 0, size: 10 } }
            );
            expect(result).toEqual(mockEvents.data);
        });

        it('searches events by query and category', async () => {
            const mockSearch = {
                data: [{ id: 1, title: 'Kathmandu Music Fest' }]
            };

            apiClient.get.mockResolvedValueOnce(mockSearch);

            const result = await eventService.searchEvents({ query: 'Music', category: 'CONCERT' });

            expect(apiClient.get).toHaveBeenCalledWith(
                '/api/events/search',
                { params: { query: 'Music', category: 'CONCERT' } }
            );
            expect(result).toEqual(mockSearch.data);
        });

        it('fetches event details with ticket tiers', async () => {
            const mockDetail = {
                data: {
                    id: 1,
                    title: 'Kathmandu Music Fest',
                    venue: 'Tundikhel',
                    ticketTiers: [
                        { name: 'VIP', price: 2500, available: 100 },
                        { name: 'General', price: 1000, available: 500 }
                    ]
                }
            };

            apiClient.get.mockResolvedValueOnce(mockDetail);

            const result = await eventService.getEventDetails(1);

            expect(apiClient.get).toHaveBeenCalledWith('/api/events/1');
            expect(result).toEqual(mockDetail.data);
        });
    });

    describe('Admin Event Moderation & Lifecycle', () => {
        it('fetches events in admin panel with filter status', async () => {
            const mockAdminList = {
                data: [
                    { id: 10, title: 'Pending Approval Event', status: 'PENDING' },
                    { id: 11, title: 'Active Expo', status: 'PUBLISHED' }
                ]
            };

            apiClient.post.mockResolvedValueOnce(mockAdminList);

            const result = await eventService.getAllEventsAdmin({ status: 'PENDING' });

            expect(apiClient.post).toHaveBeenCalledWith('/api/admin/events/search', { status: 'PENDING' });
            expect(result).toEqual(mockAdminList.data);
        });

        it('approves and publishes an event (Admin)', async () => {
            const mockApproval = {
                data: { id: 10, title: 'Approved Event', status: 'PUBLISHED' }
            };

            apiClient.post.mockResolvedValueOnce(mockApproval);

            const result = await eventService.approveEvent(10);

            expect(apiClient.post).toHaveBeenCalledWith('/api/admin/events/10/publish');
            expect(result).toEqual(mockApproval.data);
        });

        it('rejects an event with reason (Admin)', async () => {
            const mockReject = {
                data: { id: 10, status: 'CANCELLED', rejectionReason: 'Incomplete documents' }
            };

            apiClient.post.mockResolvedValueOnce(mockReject);

            const result = await eventService.rejectEvent(10, 'Incomplete documents');

            expect(apiClient.post).toHaveBeenCalledWith(
                '/api/admin/events/10/cancel',
                { reason: 'Incomplete documents', cancelledBy: 'ADMIN' }
            );
            expect(result).toEqual(mockReject.data);
        });
    });
});
