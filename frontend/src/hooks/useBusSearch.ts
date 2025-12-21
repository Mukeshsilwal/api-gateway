import { useState, useCallback } from 'react';
import { useCachedBusStops } from './useCachedBusStops';
import busService from '../services/busService';

interface BusSearchHook {
    busStops: any[];
    busStopsLoading: boolean;
    busStopsError: any;
    loading: boolean;
    error: string | null;
    searchBuses: (params: any, options?: any) => Promise<any>;
}

/**
 * Custom hook for bus search functionality
 * Provides bus stops data and search function with loading/error states
 * @returns {BusSearchHook} Bus search utilities
 */
export const useBusSearch = (): BusSearchHook => {
    // @ts-ignore - useCachedBusStops is likely JS
    const { data: busStops = [], isLoading: busStopsLoading, error: busStopsError } = useCachedBusStops();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const searchBuses = useCallback(async (params: any, options = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await busService.searchBuses(params, options);
            return response;
        } catch (err: any) {
            // Don't set error if request was cancelled
            if (err.name !== 'AbortError') {
                setError(err.message || 'Failed to search buses');
                throw err;
            }
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        busStops,
        busStopsLoading,
        busStopsError,
        loading,
        error,
        searchBuses
    };
};
