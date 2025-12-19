import { useState, useCallback } from 'react';
import { useCachedBusStops } from './useCachedBusStops';
import busService from '../services/busService';

/**
 * Custom hook for bus search functionality
 * Provides bus stops data and search function with loading/error states
 * @returns {Object} Bus search utilities
 */
export const useBusSearch = () => {
    const { data: busStops = [], isLoading: busStopsLoading, error: busStopsError } = useCachedBusStops();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchBuses = useCallback(async (params, options = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await busService.searchBuses(params, options);
            return response;
        } catch (err) {
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
