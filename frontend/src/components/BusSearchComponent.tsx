import React, { useState } from 'react';
import { ArrowRightLeft, Search, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
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
 * Reusable Bus Search Component
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

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <div className="space-y-4">
                        {/* Source */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                From
                            </label>
                            <select
                                value={searchData.source}
                                onChange={(e) => handleChange('source', e.target.value)}
                                className="input-field w-full focus-glow"
                                required
                                disabled={busStopsLoading}
                            >
                                <option value="">
                                    {busStopsLoading ? 'Loading...' : 'Select source city'}
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
                        </div>

                        {/* Destination */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                To
                            </label>
                            <select
                                value={searchData.destination}
                                onChange={(e) => handleChange('destination', e.target.value)}
                                className="input-field w-full focus-glow"
                                required
                                disabled={busStopsLoading}
                            >
                                <option value="">
                                    {busStopsLoading ? 'Loading...' : 'Select destination city'}
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
                        </div>
                    </div>

                    {/* Swap Button */}
                    <button
                        type="button"
                        onClick={handleSwap}
                        className="absolute right-4 top-[38%] -translate-y-1/2 p-2 bg-gray-100 rounded-full hover:bg-primary hover:text-white transition-all shadow-sm z-10"
                        title="Swap Locations"
                        disabled={busStopsLoading}
                    >
                        <ArrowRightLeft size={16} />
                    </button>
                </div>

                {/* Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Travel Date
                    </label>
                    <input
                        type="date"
                        value={searchData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        min={today}
                        className="input-field w-full focus-glow"
                        required
                    />
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    size="lg"
                    className="w-full group"
                    disabled={isSearching || busStopsLoading}
                >
                    {isSearching ? (
                        <>
                            <Loader className="mr-2 animate-spin" size={20} />
                            Searching...
                        </>
                    ) : (
                        <>
                            <Search className="mr-2 group-hover:scale-110 transition-transform" size={20} />
                            Search Buses
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
};

export default BusSearchComponent;