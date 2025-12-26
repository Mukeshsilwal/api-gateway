import { useState } from 'react';
import { ArrowRightLeft, Search, Loader, MapPin, Calendar, Flame } from 'lucide-react';
import toast from "react-hot-toast";
import { useBusSearch } from '../hooks/useBusSearch';
import Button from './ui/Button';

interface SearchParams {
    source: string;
    destination: string;
    date: string;
}

interface BusSearchProps {
    onSearch: (params: SearchParams) => void;
    initialValues?: Partial<SearchParams>;
    variant?: 'compact' | 'full';
    showTitle?: boolean;
}

/**
 * Reusable Bus Search Component - Premium Design
 */
const BusSearchComponent: React.FC<BusSearchProps> = ({
    onSearch,
    initialValues = {},
    variant = 'compact',
    showTitle = false
}) => {
    const { busStops, busStopsLoading } = useBusSearch();
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const today = new Date().toISOString().split('T')[0];

    const [searchData, setSearchData] = useState<SearchParams>({
        source: initialValues.source || '',
        destination: initialValues.destination || '',
        date: initialValues.date || ''
    });

    const handleSwap = () => {
        setSearchData(prev => ({
            ...prev,
            source: prev.destination,
            destination: prev.source
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!searchData.source || !searchData.destination || !searchData.date) {
            toast.error('Please fill all fields');
            return;
        }

        if (searchData.source === searchData.destination) {
            toast.error('Source and destination cannot be the same');
            return;
        }

        setIsSearching(true);
        try {
            await onSearch(searchData);
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Search failed. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleChange = (field: keyof SearchParams, value: string) => {
        setSearchData(prev => ({ ...prev, [field]: value }));
    };

    // Helper function to extract stop data from various API formats
    const extractStopData = (stop: any): { name: string; value: string } => {
        if (typeof stop === 'string') {
            return { name: stop, value: stop };
        }

        // Handle the new API format: { busStop: { id, name }, routes, routeCount }
        if (stop && stop.busStop && typeof stop.busStop === 'object') {
            return {
                name: String(stop.busStop.name || 'Unknown'),
                value: String(stop.busStop.name || stop.busStop.id || '')
            };
        }

        // Handle direct object format: { id, name }
        if (stop && typeof stop === 'object' && stop.name) {
            return {
                name: String(stop.name),
                value: String(stop.name || stop.id || '')
            };
        }

        // Fallback
        return {
            name: String(stop || 'Unknown'),
            value: String(stop || '')
        };
    };

    return (
        <div className={variant === 'full' ? 'w-full' : ''}>
            {showTitle && (
                <h3 className="text-lg font-bold text-gray-900 mb-4">Search Buses</h3>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* From & To Section with Swap */}
                <div className="relative">
                    <div className="grid grid-cols-1 gap-4">
                        {/* From Field */}
                        <div className="relative group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-purple-500" />
                                From
                            </label>
                            <div className="relative">
                                <select
                                    value={searchData.source}
                                    onChange={(e) => handleChange('source', e.target.value)}
                                    className="w-full px-4 py-3.5 pl-11 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 appearance-none cursor-pointer hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    required
                                    disabled={busStopsLoading}
                                >
                                    <option value="">
                                        {busStopsLoading ? 'Loading...' : 'Select City'}
                                    </option>
                                    {busStops.map((stop: any, index: number) => {
                                        const { name, value } = extractStopData(stop);
                                        return (
                                            <option key={`source-${index}-${value}`} value={value}>
                                                {name}
                                            </option>
                                        );
                                    })}
                                </select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* To Field */}
                        <div className="relative group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-orange-500" />
                                To
                            </label>
                            <div className="relative">
                                <select
                                    value={searchData.destination}
                                    onChange={(e) => handleChange('destination', e.target.value)}
                                    className="w-full px-4 py-3.5 pl-11 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-200 appearance-none cursor-pointer hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    required
                                    disabled={busStopsLoading}
                                >
                                    <option value="">
                                        {busStopsLoading ? 'Loading...' : 'Select City'}
                                    </option>
                                    {busStops.map((stop: any, index: number) => {
                                        const { name, value } = extractStopData(stop);
                                        return (
                                            <option key={`dest-${index}-${value}`} value={value}>
                                                {name}
                                            </option>
                                        );
                                    })}
                                </select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Swap Button - Centered between fields */}
                    <button
                        type="button"
                        onClick={handleSwap}
                        className="absolute right-4 top-[calc(50%-12px)] -translate-y-1/2 p-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full hover:scale-110 hover:rotate-180 transition-all duration-300 shadow-lg hover:shadow-xl z-10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:rotate-0"
                        title="Swap Locations"
                        disabled={busStopsLoading}
                    >
                        <ArrowRightLeft size={18} />
                    </button>
                </div>

                {/* Date Field */}
                <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        Travel Date
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            value={searchData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                            min={today}
                            className="w-full px-4 py-3.5 pl-11 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 cursor-pointer hover:border-blue-300"
                            required
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Popular Routes Badge */}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 px-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">Popular routes today</span>
                    <span className="ml-auto font-semibold text-purple-600 dark:text-purple-400">Starting from NPR 800</span>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    size="lg"
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    disabled={isSearching || busStopsLoading}
                >
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <div className="relative flex items-center justify-center gap-2">
                        {isSearching ? (
                            <>
                                <Loader className="animate-spin" size={22} />
                                <span className="text-base">Searching...</span>
                            </>
                        ) : (
                            <>
                                <Search className="group-hover:scale-110 transition-transform" size={22} />
                                <span className="text-base">Search Buses</span>
                            </>
                        )}
                    </div>
                </Button>
            </form>
        </div>
    );
};

export default BusSearchComponent;
