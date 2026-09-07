import { describe, it, expect, vi, beforeEach } from 'vitest';
import hotelService from '../hotelService';
import apiService from '../api.service';

vi.mock('../api.service', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    }
}));

describe('HotelService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('User Search & Filtering', () => {
        it('searches hotels with city, star rating, and price parameters', async () => {
            const mockResponse = {
                data: {
                    content: [
                        { id: 1, name: 'Hotel Annapurna', city: 'Kathmandu', stars: 5, pricePerNight: 8500 },
                        { id: 2, name: 'Lakeside Resort', city: 'Pokhara', stars: 4, pricePerNight: 5000 }
                    ],
                    totalElements: 2
                }
            };

            apiService.post.mockResolvedValueOnce(mockResponse);

            const searchParams = {
                city: 'Kathmandu',
                minStars: 4,
                minPrice: 3000,
                maxPrice: 10000
            };

            const result = await hotelService.searchHotels(searchParams);

            expect(apiService.post).toHaveBeenCalledWith(
                expect.any(String),
                searchParams
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('Admin Hotel & Room Management', () => {
        it('creates a new hotel in admin panel', async () => {
            const hotelPayload = {
                name: 'Heritage Palace',
                city: 'Lalitpur',
                address: 'Patan Durbar Square',
                starRating: 5,
                amenities: ['wifi', 'pool', 'spa']
            };

            const mockCreated = {
                data: {
                    hotelId: 55,
                    hotelCode: 'HOTEL-HP-55',
                    name: 'Heritage Palace',
                    city: 'Lalitpur'
                }
            };

            apiService.post.mockResolvedValueOnce(mockCreated);

            const result = await hotelService.createHotel(hotelPayload);

            expect(apiService.post).toHaveBeenCalledWith(
                expect.any(String),
                hotelPayload
            );
            expect(result).toEqual(mockCreated.data);
        });

        it('adds a room type with pricing to a hotel', async () => {
            const roomPayload = {
                roomType: 'DELUXE_SUITE',
                price: 12000,
                capacity: 2,
                availableCount: 5
            };

            const mockRoomResponse = {
                data: {
                    roomId: 101,
                    roomType: 'DELUXE_SUITE',
                    price: 12000
                }
            };

            apiService.post.mockResolvedValueOnce(mockRoomResponse);

            const result = await hotelService.addRoom('HOTEL-HP-55', roomPayload);

            expect(apiService.post).toHaveBeenCalledWith(
                expect.stringContaining('HOTEL-HP-55/rooms'),
                roomPayload
            );
            expect(result).toEqual(mockRoomResponse.data);
        });
    });
});
