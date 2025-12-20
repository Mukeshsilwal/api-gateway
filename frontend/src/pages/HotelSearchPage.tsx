import React, { useState } from 'react';
import { useHotelSearch } from '../../hooks/useApi';
import SearchForm, { SearchParams } from '../../components/forms/SearchForm';
import HotelCard from '../../components/cards/HotelCard';
import { useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';

/**
 * Hotel Search Page
 * Unified search with filters and results
 */
const HotelSearchPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
    const [filters, setFilters] = useState({
        minPrice: 0,
        maxPrice: 50000,
        minRating: 0,
        amenities: [] as string[],
    });
    const [showFilters, setShowFilters] = useState(false);

    const { data: hotels, isLoading, error } = useHotelSearch(
        {
            city: searchParams?.location,
            checkIn: searchParams?.checkIn,
            checkOut: searchParams?.checkOut,
            guests: searchParams?.guests,
        },
        { enabled: !!searchParams }
    );

    const handleSearch = (params: SearchParams) => {
        setSearchParams(params);
    };

    const handleBookHotel = (hotelId: number) => {
        navigate(`/hotels/${hotelId}/book`, {
            state: { searchParams }
        });
    };

    const handleViewDetails = (hotelId: number) => {
        navigate(`/hotels/${hotelId}`);
    };

    // Apply filters
    const filteredHotels = hotels?.filter(hotel => {
        if (hotel.startingPrice < filters.minPrice || hotel.startingPrice > filters.maxPrice) {
            return false;
        }
        if (hotel.rating && hotel.rating < filters.minRating) {
            return false;
        }
        if (filters.amenities.length > 0) {
            const hasAllAmenities = filters.amenities.every(amenity =>
                hotel.amenities?.includes(amenity)
            );
            if (!hasAllAmenities) return false;
        }
        return true;
    });

    const availableAmenities = ['WiFi', 'Parking', 'Restaurant', 'Pool', 'Gym', 'Spa'];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section with Search */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">Find Your Perfect Stay</h1>
                    <p className="text-blue-100 mb-8">Discover amazing hotels across Nepal</p>

                    <SearchForm type="hotel" onSearch={handleSearch} />
                </div>
            </div>

            {/* Results Section */}
            {searchParams && (
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex gap-6">
                        {/* Filters Sidebar */}
                        <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
                            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <SlidersHorizontal size={20} />
                                        Filters
                                    </h3>
                                    <button
                                        onClick={() => setFilters({
                                            minPrice: 0,
                                            maxPrice: 50000,
                                            minRating: 0,
                                            amenities: [],
                                        })}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Clear
                                    </button>
                                </div>

                                {/* Price Range */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price Range (NPR)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.minPrice}
                                            onChange={(e) => setFilters(prev => ({ ...prev, minPrice: parseInt(e.target.value) || 0 }))}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.maxPrice}
                                            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) || 50000 }))}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Rating
                                    </label>
                                    <select
                                        value={filters.minRating}
                                        onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    >
                                        <option value="0">Any</option>
                                        <option value="3">3+ Stars</option>
                                        <option value="4">4+ Stars</option>
                                        <option value="4.5">4.5+ Stars</option>
                                    </select>
                                </div>

                                {/* Amenities */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amenities
                                    </label>
                                    <div className="space-y-2">
                                        {availableAmenities.map(amenity => (
                                            <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.amenities.includes(amenity)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFilters(prev => ({ ...prev, amenities: [...prev.amenities, amenity] }));
                                                        } else {
                                                            setFilters(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity) }));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">{amenity}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="flex-1">
                            {/* Results Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {filteredHotels?.length || 0} Hotels Found
                                    </h2>
                                    <p className="text-gray-600 text-sm">
                                        {searchParams.location} • {searchParams.checkIn} - {searchParams.checkOut}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="lg:hidden px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2"
                                >
                                    <Filter size={18} />
                                    Filters
                                </button>
                            </div>

                            {/* Loading State */}
                            {isLoading && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="bg-white rounded-xl shadow-md h-96 animate-pulse"></div>
                                    ))}
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                    <p className="text-red-700">Failed to load hotels. Please try again.</p>
                                </div>
                            )}

                            {/* Results Grid */}
                            {!isLoading && !error && filteredHotels && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredHotels.map(hotel => (
                                        <HotelCard
                                            key={hotel.id}
                                            hotel={hotel}
                                            onBook={handleBookHotel}
                                            onViewDetails={handleViewDetails}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {!isLoading && !error && filteredHotels?.length === 0 && (
                                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                    <p className="text-gray-500 text-lg">No hotels found matching your criteria</p>
                                    <button
                                        onClick={() => setFilters({
                                            minPrice: 0,
                                            maxPrice: 50000,
                                            minRating: 0,
                                            amenities: [],
                                        })}
                                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Initial State */}
            {!searchParams && (
                <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Start Your Search
                    </h2>
                    <p className="text-gray-600">
                        Enter your destination and dates above to find available hotels
                    </p>
                </div>
            )}
        </div>
    );
};

export default HotelSearchPage;
