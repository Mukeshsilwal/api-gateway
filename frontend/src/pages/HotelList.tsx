import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from 'react-hot-toast';
import hotelService from "../services/hotel.service";
import NavigationBar from "../components/Navbar";
import Footer from "../components/Footer";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

interface HotelListFilters {
    city: string;
    minRating: number;
    maxPrice: number;
    stars: number;
}

const HotelList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Memoize default params to prevent unstable dependency in useCallback
    const defaultParams = useMemo(() => location.state || {}, [location.state]);

    const [hotels, setHotels] = useState<any[]>([]);
    const [filteredHotels, setFilteredHotels] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<HotelListFilters>({
        city: defaultParams.city || "",
        minRating: 0,
        maxPrice: 10000,
        stars: 0
    });

    // Debounce filters to reduce API calls
    const debouncedFilters = useDebouncedValue(filters, 400);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchHotels = useCallback(async () => {
        // Cancel previous request if still pending
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        try {
            // Prepare search criteria (using debounced filters)
            const criteria = {
                city: debouncedFilters.city || defaultParams.city,
                minStars: debouncedFilters.stars > 0 ? debouncedFilters.stars : undefined,
                minRating: debouncedFilters.minRating > 0 ? debouncedFilters.minRating : undefined,
                minPrice: 0,
                maxPrice: debouncedFilters.maxPrice < 10000 ? debouncedFilters.maxPrice : undefined,
                checkIn: defaultParams.checkInDate,
                checkOut: defaultParams.checkOutDate,
                guests: defaultParams.guests ? parseInt(defaultParams.guests) : undefined,
                amenities: [],
                sortBy: "PRICE_ASC",
                limit: 50,
                offset: 0
            };

            const result = await hotelService.searchHotels(criteria, {
                signal: abortControllerRef.current.signal
            });

            const finalResult = Array.isArray(result) ? result : (result as any).hotels || [];

            setHotels(finalResult);
            setFilteredHotels(finalResult);
        } catch (error: any) {
            // Don't show error if request was cancelled
            if (error.name === 'AbortError') {
                console.log('Request cancelled');
                return;
            }
            toast.error("Failed to load hotels. Please try again.");
            console.error("Error loading hotels:", error);
            setFilteredHotels([]);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedFilters, defaultParams]);

    // Fetch hotels when debounced filters change
    useEffect(() => {
        fetchHotels();
    }, [fetchHotels]);

    // Cleanup: abort any pending requests on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const handleFilterChange = (key: keyof HotelListFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleHotelClick = (hotel: any) => {
        const hotelId = hotel.hotelId || hotel.hotelCode || hotel.id;
        const params = new URLSearchParams(location.search);
        const tripId = params.get('tripId');

        navigate(`/hotels/${hotelId}`, {
            state: {
                hotel, // Pass the full hotel object to avoid redundant fetching
                checkIn: defaultParams.checkInDate,
                checkOut: defaultParams.checkOutDate,
                guests: defaultParams.guests,
                tripId: tripId // Pass tripId to details page
            }
        });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <NavigationBar />

            <main className="flex-grow pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            {defaultParams.city ? `Hotels in ${defaultParams.city}` : 'All Hotels'}
                        </h1>
                        <p className="text-gray-600">
                            {defaultParams.checkInDate && defaultParams.checkOutDate && (
                                `${defaultParams.checkInDate} - ${defaultParams.checkOutDate} • ${defaultParams.guests} Guest${Number(defaultParams.guests) > 1 ? 's' : ''}`
                            )}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                        {/* Filters Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Filters</h3>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <input
                                        type="text"
                                        value={filters.city}
                                        onChange={(e) => handleFilterChange('city', e.target.value)}
                                        placeholder="Enter city name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stars</label>
                                    <select
                                        value={filters.stars}
                                        onChange={(e) => handleFilterChange('stars', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="0">All</option>
                                        <option value="3">3+ Stars</option>
                                        <option value="4">4+ Stars</option>
                                        <option value="5">5 Stars</option>
                                    </select>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Rating: {filters.minRating.toFixed(1)}
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="5"
                                        step="0.5"
                                        value={filters.minRating}
                                        onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>0</span>
                                        <span>5</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setFilters({ city: "", minRating: 0, maxPrice: 10000, stars: 0 })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>

                        {/* Hotel List */}
                        <div className="lg:col-span-3">
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                                            <div className="h-48 bg-gray-300"></div>
                                            <div className="p-6 space-y-3">
                                                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                                                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                                <div className="h-4 bg-gray-300 rounded w-full"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredHotels.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Hotels Found</h3>
                                    <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria</p>
                                    <button
                                        onClick={() => setFilters({ city: "", minRating: 0, maxPrice: 10000, stars: 0 })}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 text-sm text-gray-600">
                                        Showing {filteredHotels.length} {filteredHotels.length === 1 ? 'hotel' : 'hotels'}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {filteredHotels.map((hotel, index) => (
                                            <div
                                                key={hotel.hotelId || hotel.hotelCode || hotel.id || `hotel-${index}`}
                                                onClick={() => handleHotelClick(hotel)}
                                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                                            >
                                                <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
                                                    {hotel.images && hotel.images.length > 0 ? (
                                                        <img
                                                            src={hotel.images[0]}
                                                            alt={hotel.name}
                                                            loading="lazy"
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                            onError={(e: any) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "https://placehold.co/400x200?text=Hotel+Image";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </div>
                                                    )}

                                                    {hotel.stars && (
                                                        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg shadow-md flex items-center gap-1">
                                                            <span className="text-yellow-500">★</span>
                                                            <span className="text-sm font-semibold">{hotel.stars}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-6">
                                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                                        {hotel.name}
                                                    </h3>

                                                    <div className="flex items-center text-gray-600 text-sm mb-2">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {hotel.city && hotel.country ? `${hotel.city}, ${hotel.country}` : hotel.city || hotel.address}
                                                    </div>

                                                    {hotel.rating && (
                                                        <div className="flex items-center mb-3">
                                                            <div className="flex items-center bg-indigo-600 text-white px-2 py-1 rounded text-sm font-semibold">
                                                                {hotel.rating.toFixed(1)}
                                                            </div>
                                                            <span className="ml-2 text-sm text-gray-600">User Rating</span>
                                                        </div>
                                                    )}

                                                    {hotel.description && (
                                                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                                            {hotel.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center text-indigo-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                                                        View Details
                                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default HotelList;
