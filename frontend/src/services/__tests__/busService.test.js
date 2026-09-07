import { describe, it, expect, vi, beforeEach } from 'vitest';
import busService from '../busService';
import apiService from '../api.service';

vi.mock('../api.service', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

describe('BusService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('User Search & Details', () => {
        it('searches buses with source, destination, and date', async () => {
            const mockSearchResponse = {
                data: {
                    results: [
                        { id: 1, busNumber: 'BA 2 KHA 1234', operator: 'Super Deluxe', price: 1200, availableSeats: 25 },
                        { id: 2, busNumber: 'BA 3 KHA 5678', operator: 'Greenline', price: 1500, availableSeats: 10 }
                    ],
                    totalCount: 2
                }
            };

            apiService.post.mockResolvedValueOnce(mockSearchResponse);

            const searchParams = {
                source: 'Kathmandu',
                destination: 'Pokhara',
                date: '2026-09-10'
            };

            const result = await busService.searchBuses(searchParams);

            expect(apiService.post).toHaveBeenCalledWith(
                expect.stringContaining('/buses/search'),
                expect.objectContaining({
                    source: 'Kathmandu',
                    destination: 'Pokhara',
                    date: '2026-09-10'
                }),
                expect.any(Object)
            );
            expect(result).toEqual(mockSearchResponse);
        });

        it('fetches complete bus details including layout and stops', async () => {
            const mockDetails = {
                data: {
                    busId: 10,
                    busName: 'Yeti Travels',
                    totalSeats: 36,
                    seats: [{ seatNumber: 'A1', status: 'AVAILABLE', price: 1100 }],
                    route: { origin: 'Kathmandu', destination: 'Chitwan' }
                }
            };

            apiService.get.mockResolvedValueOnce(mockDetails);

            const result = await busService.getBusCompleteDetails(10);

            expect(apiService.get).toHaveBeenCalledWith(
                expect.stringContaining('/10/complete')
            );
            expect(result).toEqual(mockDetails.data);
        });
    });

    describe('Admin Fleet Operations', () => {
        it('fetches bus dashboard statistics for admin panel', async () => {
            const mockDashboard = {
                data: {
                    totalBuses: 45,
                    activeTrips: 18,
                    occupancyRate: 82.5,
                    revenueToday: 150000
                }
            };

            apiService.get.mockResolvedValueOnce(mockDashboard);

            const result = await busService.getBusDashboard();

            expect(apiService.get).toHaveBeenCalled();
            expect(result).toEqual(mockDashboard.data);
        });

        it('fetches all available bus stops and routes', async () => {
            const mockStops = {
                data: ['Kathmandu', 'Pokhara', 'Chitwan', 'Lumbini', 'Birgunj']
            };

            apiService.get.mockResolvedValueOnce(mockStops);

            const result = await busService.getBusStops();

            expect(apiService.get).toHaveBeenCalled();
            expect(result).toEqual(mockStops);
        });
    });
});
