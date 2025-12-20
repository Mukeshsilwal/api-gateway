import React, { useState } from 'react';
import { useBusSearch } from '../../hooks/useApi';
import SearchForm, { SearchParams } from '../../components/forms/SearchForm';
import BusCard from '../../components/cards/BusCard';
import { useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';

/**
 * Bus Search Page
 * Search buses with filters
 */
const BusSearchPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
    const [filters, setFilters] = useState({
        busType: 'all',
        minPrice: 0,
        maxPrice: 5000,
        departureTime: 'all', // morning, afternoon, evening, night
    });
    const [showFilters, setShowFilters] = useState(false);

    const { data: buses, isLoading, error } = useBusSearch(
        {
            origin: searchParams?.origin || '',
            destination: searchParams?.destination || '',
            date: searchParams?.date || '',
        },
        { enabled: !!searchParams }
    );

    const handleSearch = (params: SearchParams) => {
        setSearchParams(params);
    };

    const handleViewSeats = (busId: number) => {
        navigate(`/buses/${busId}/seats`, {
            state: { searchParams }
        });
    };

    // Apply filters
    const filteredBuses = buses?.filter(bus => {
        // Bus type filter
        if (filters.busType !== 'all' && bus.busType !== filters.busType) {
            return false;
        }

        // Price filter
        if (bus.basePrice < filters.minPrice || bus.basePrice > filters.maxPrice) {
            return false;
        }

        // Departure time filter
        if (filters.departureTime !== 'all') {
            const hour = new Date(bus.departureDateTime).getHours();
            switch (filters.departureTime) {
                case 'morning':
                    if (hour < 6 || hour >= 12) return false;
                    break;
                case 'afternoon':
                    if (hour < 12 || hour >= 18) return false;
                    break;
                case 'evening':
                    if (hour < 18 || hour >= 22) return false;
                    break;
                case 'night':
                    if (hour >= 6 && hour < 22) return false;
                    break;
            }
        }

        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section with Search */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">Book Your Bus Tickets</h1>
                    <p className="text-blue-100 mb-8">Travel comfortably across Nepal</p>

                    <SearchForm type="bus" onSearch={handleSearch} />
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
                                            busType: 'all',
                                            minPrice: 0,
                                            maxPrice: 5000,
                                            departureTime: 'all',
                                        })}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Clear
                                    </button>
                                </div>

                                {/* Bus Type */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bus Type
                                    </label>
                                    <select
                                        value={filters.busType}
                                        onChange={(e) => setFilters(prev => ({ ...prev, busType: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="AC">AC</option>
                                        <option value="Non-AC">Non-AC</option>
                                        <option value="Deluxe">Deluxe</option>
                                        <option value="Sleeper">Sleeper</option>
                                    </select>
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
                                            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) || 5000 }))}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Departure Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Departure Time
                                    </label>
                                    <select
                                        value={filters.departureTime}
                                        onChange={(e) => setFilters(prev => ({ ...prev, departureTime: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    >
                                        <option value="all">Any Time</option>
                                        <option value="morning">Morning (6 AM - 12 PM)</option>
                                        <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
                                        <option value="evening">Evening (6 PM - 10 PM)</option>
                                        <option value="night">Night (10 PM - 6 AM)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="flex-1">
                            {/* Results Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {filteredBuses?.length || 0} Buses Found
                                    </h2>
                                    <p className="text-gray-600 text-sm">
                                        {searchParams.origin} → {searchParams.destination} • {searchParams.date}
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
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-white rounded-xl shadow-md h-64 animate-pulse"></div>
                                    ))}
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                    <p className="text-red-700">Failed to load buses. Please try again.</p>
                                </div>
                            )}

                            {/* Results List */}
                            {!isLoading && !error && filteredBuses && (
                                <div className="space-y-4">
                                    {filteredBuses.map(bus => (
                                        <BusCard
                                            key={bus.routeId}
                                            bus={bus}
                                            onViewSeats={handleViewSeats}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {!isLoading && !error && filteredBuses?.length === 0 && (
                                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                    <p className="text-gray-500 text-lg">No buses found matching your criteria</p>
                                    <button
                                        onClick={() => setFilters({
                                            busType: 'all',
                                            minPrice: 0,
                                            maxPrice: 5000,
                                            departureTime: 'all',
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
                        Start Your Journey
                    </h2>
                    <p className="text-gray-600">
                        Enter your origin, destination, and travel date above to find available buses
                    </p>
                </div>
            )}
        </div>
    );
};

export default BusSearchPage;
