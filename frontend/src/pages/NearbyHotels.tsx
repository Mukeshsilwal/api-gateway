import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, SlidersHorizontal, Loader, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';
import { HotelCard } from '../components/hotels/HotelCard';
import HotelFilters from '../components/hotels/HotelFilters';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import useGeolocation from '../hooks/useGeolocation';
import useHotelFilters from '../hooks/useHotelFilters';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import hotelService from '../services/hotel.service';

interface Hotel {
    hotelCode: string;
    [key: string]: any;
}

/**
 * NearbyHotels Page
 * Location-based hotel search with filters and infinite scroll
 */
const NearbyHotels = () => {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [totalResults, setTotalResults] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(true);

    const { location, error: locationError, loading: locationLoading, requestLocation } = useGeolocation();
    const { filters, setRadius, setMinStars, setMaxPrice, setAmenities, setSortBy, toggleAmenity, resetFilters, updateFilter } = useHotelFilters();

    const fetchMoreHotels = useCallback(async () => {
        if (!location || loading) return;

        try {
            const response = await hotelService.getNearbyHotels({
                latitude: location.lat,
                longitude: location.lon,
                radiusKm: filters.radiusKm,
                minStarRating: filters.minStarRating,
                maxPrice: filters.maxPrice,
                amenities: filters.amenities?.length > 0 ? filters.amenities : null,
                sortBy: filters.sortBy,
                page: page,
                limit: 10
            });

            const newHotels = response.hotels || [];
            setHotels(prev => page === 1 ? newHotels : [...prev, ...newHotels]);
            setTotalResults(response.totalResults || 0);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error('Error fetching nearby hotels:', error);
            toast.error('Failed to load hotels');
        }
    }, [location, filters, loading]);

    const { page, loadMoreRef, reset } = useInfiniteScroll(
        fetchMoreHotels,
        page < totalPages
    );

    // Request location on mount
    useEffect(() => {
        requestLocation();
    }, []);

    // Fetch hotels when location or filters change
    useEffect(() => {
        if (location) {
            reset();
            setHotels([]);
            loadHotels();
        }
    }, [location, filters]);

    const loadHotels = async () => {
        if (!location) return;

        try {
            setLoading(true);
            const response = await hotelService.getNearbyHotels({
                latitude: location.lat,
                longitude: location.lon,
                radiusKm: filters.radiusKm,
                minStarRating: filters.minStarRating,
                maxPrice: filters.maxPrice,
                amenities: filters.amenities?.length > 0 ? filters.amenities : null,
                sortBy: filters.sortBy,
                page: 1,
                limit: 10
            });

            setHotels(response.hotels || []);
            setTotalResults(response.totalResults || 0);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error('Error fetching nearby hotels:', error);
            toast.error('Failed to load hotels');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: any) => {
        updateFilter(key, value);
    };

    const handleResetFilters = () => {
        resetFilters();
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <NavigationBar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <MapPin className="text-primary" />
                            Nearby Hotels
                        </h1>
                        <p className="text-slate-600 mt-2">
                            {totalResults > 0
                                ? `${totalResults} hotels found within ${filters.radiusKm} km`
                                : 'Discover hotels near you'}
                        </p>
                    </div>

                    {/* Location Permission */}
                    {!location && !locationLoading && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center mb-8">
                            <MapPin size={48} className="mx-auto text-primary mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                Enable Location Access
                            </h3>
                            <p className="text-slate-600 mb-6">
                                {locationError || 'Allow location access to find hotels near you'}
                            </p>
                            <button
                                onClick={requestLocation}
                                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                            >
                                Enable Location
                            </button>
                        </div>
                    )}

                    {/* Loading Location */}
                    {locationLoading && (
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner size="large" />
                            <span className="ml-3 text-slate-600">Getting your location...</span>
                        </div>
                    )}

                    {/* Content */}
                    {location && (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Filters Sidebar */}
                            <div className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                                <div className="sticky top-24">
                                    <HotelFilters
                                        filters={filters}
                                        onFilterChange={handleFilterChange}
                                        onReset={handleResetFilters}
                                    />
                                </div>
                            </div>

                            {/* Hotels Grid */}
                            <div className="flex-1">
                                {/* Mobile Filter Toggle */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    <SlidersHorizontal size={20} />
                                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                                </button>

                                {/* Loading */}
                                {loading && hotels.length === 0 && (
                                    <div className="flex justify-center items-center h-64">
                                        <LoadingSpinner size="large" />
                                    </div>
                                )}

                                {/* Hotels Grid */}
                                {!loading && hotels.length === 0 && (
                                    <div className="text-center py-16">
                                        <AlertCircle size={48} className="mx-auto text-slate-400 mb-4" />
                                        <p className="text-slate-600 text-lg">No hotels found matching your criteria</p>
                                        <button
                                            onClick={handleResetFilters}
                                            className="mt-4 text-primary font-semibold hover:underline"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                )}

                                {hotels.length > 0 && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {hotels.map((hotel) => (
                                                <HotelCard key={hotel.hotelCode} hotel={hotel} />
                                            ))}
                                        </div>

                                        {/* Infinite Scroll Trigger */}
                                        {page < totalPages && (
                                            <div ref={loadMoreRef} className="flex justify-center items-center py-8">
                                                <Loader className="animate-spin text-primary" size={32} />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default NearbyHotels;
