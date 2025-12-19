import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HotelSearchBar } from './HotelSearchBar';
import { HotelFiltersPanel } from './HotelFiltersPanel';
import { HotelList } from './HotelList';
import { AvailabilityModal } from './AvailabilityModal';
import hotelsApi from '../../api/hotelsApi';

// Mock dependencies
vi.mock('../../api/hotelsApi');
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

const mockHotel = {
    hotelId: 1,
    hotelName: 'Test Hotel',
    city: 'Kathmandu',
    stars: 5,
    price: 1000,
    thumbnailUrl: 'test.jpg',
    shortDescription: 'A test hotel'
};

describe('Hotel Components', () => {

    describe('HotelSearchBar', () => {
        beforeEach(() => {
            hotelsApi.getCities.mockResolvedValue(['Kathmandu', 'Pokhara']);
        });

        it('renders inputs correctly', async () => {
            render(
                <BrowserRouter>
                    <HotelSearchBar />
                </BrowserRouter>
            );
            expect(screen.getByPlaceholderText(/Where are you going/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/Hotel name/i)).toBeInTheDocument();
        });

        it('updates city input on change', () => {
            render(
                <BrowserRouter>
                    <HotelSearchBar />
                </BrowserRouter>
            );
            const cityInput = screen.getByPlaceholderText(/Where are you going/i);
            fireEvent.change(cityInput, { target: { value: 'Kath' } });
            expect(cityInput.value).toBe('Kath');
        });
    });

    describe('HotelFiltersPanel', () => {
        const mockFilters = {
            amenities: ['wifi', 'pool']
        };
        const mockOnChange = vi.fn();

        it('renders filter options', () => {
            render(
                <HotelFiltersPanel
                    filters={mockFilters}
                    selectedFilters={{}}
                    onChange={mockOnChange}
                />
            );
            expect(screen.getByText('Price Range')).toBeInTheDocument();
            expect(screen.getByText('Star Rating')).toBeInTheDocument();
            expect(screen.getByText('wifi')).toBeInTheDocument();
        });

        it('calls onChange when price changes', () => {
            render(
                <HotelFiltersPanel
                    filters={mockFilters}
                    selectedFilters={{}}
                    onChange={mockOnChange}
                />
            );
            const maxPriceInput = screen.getAllByRole('spinbutton')[1]; // Max price
            fireEvent.change(maxPriceInput, { target: { value: '5000' } });
            expect(mockOnChange).toHaveBeenCalledWith({ maxPrice: 5000 });
        });
    });

    describe('HotelList', () => {
        it('renders loading skeletons', () => {
            render(<HotelList hotels={[]} loading={true} hasMore={true} loadMore={() => { }} />);
            // Check for pulse animation class or structure
            const skeletons = document.querySelectorAll('.animate-pulse');
            expect(skeletons.length).toBeGreaterThan(0);
        });

        it('renders hotel cards', () => {
            render(
                <BrowserRouter>
                    <HotelList hotels={[mockHotel]} loading={false} hasMore={false} loadMore={() => { }} />
                </BrowserRouter>
            );
            expect(screen.getByText('Test Hotel')).toBeInTheDocument();
            expect(screen.getByText('Kathmandu')).toBeInTheDocument();
        });

        it('renders empty state', () => {
            render(<HotelList hotels={[]} loading={false} hasMore={false} loadMore={() => { }} />);
            expect(screen.getByText('No hotels found')).toBeInTheDocument();
        });
    });

    describe('AvailabilityModal', () => {
        it('renders when open', () => {
            render(
                <BrowserRouter>
                    <AvailabilityModal isOpen={true} onClose={() => { }} hotel={mockHotel} />
                </BrowserRouter>
            );
            expect(screen.getByText(/Check Availability - Test Hotel/i)).toBeInTheDocument();
        });

        it('submits availability check', async () => {
            hotelsApi.checkAvailability.mockResolvedValue({ availableRooms: [] });
            render(
                <BrowserRouter>
                    <AvailabilityModal isOpen={true} onClose={() => { }} hotel={mockHotel} />
                </BrowserRouter>
            );

            // Fill form
            fireEvent.change(screen.getByLabelText(/Check-in/i), { target: { value: '2025-12-01' } });
            fireEvent.change(screen.getByLabelText(/Check-out/i), { target: { value: '2025-12-05' } });

            fireEvent.click(screen.getByText('Check Availability'));

            await waitFor(() => {
                expect(hotelsApi.checkAvailability).toHaveBeenCalled();
            });
        });
    });
});
