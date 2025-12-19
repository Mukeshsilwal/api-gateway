import { useState, useCallback } from 'react';
import { API_STATUS } from '../core/constants';

/**
 * Custom hook for handling API calls with loading, error, and data states
 * 
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} - { data, loading, error, status, execute, reset }
 * 
 * @example
 * const { data: buses, loading, error, execute: fetchBuses } = useApi(busService.getBuses);
 * 
 * useEffect(() => {
 *   fetchBuses(searchParams);
 * }, [searchParams]);
 */
export function useApi(apiFunction) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState(API_STATUS.IDLE);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        setStatus(API_STATUS.LOADING);

        try {
            const result = await apiFunction(...args);
            setData(result);
            setStatus(API_STATUS.SUCCESS);
            return result;
        } catch (err) {
            const errorMessage = err.message || 'An error occurred';
            setError(errorMessage);
            setStatus(API_STATUS.ERROR);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
        setStatus(API_STATUS.IDLE);
    }, []);

    return {
        data,
        loading,
        error,
        status,
        execute,
        reset,
        // Convenience flags
        isIdle: status === API_STATUS.IDLE,
        isLoading: status === API_STATUS.LOADING,
        isSuccess: status === API_STATUS.SUCCESS,
        isError: status === API_STATUS.ERROR
    };
}

export default useApi;
