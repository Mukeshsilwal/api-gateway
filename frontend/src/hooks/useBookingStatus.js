import { useState, useCallback } from 'react';
import bookingApi from '../services/bookingApi';
import { pollBookingStatus } from '../utils/pollBookingStatus';
import Logger from '../utils/logger';

/**
 * Hook for polling booking status
 * @param {string} bookingId - Booking ID to poll
 * @returns {object} - { status, isPolling, startPolling, stopPolling, pollingAttempt }
 */
export default function useBookingStatus(bookingId) {
    const [status, setStatus] = useState(null);
    const [isPolling, setIsPolling] = useState(false);
    const [pollingAttempt, setPollingAttempt] = useState(0);
    const [error, setError] = useState(null);

    const startPolling = useCallback(async (options = {}) => {
        if (!bookingId) {
            setError('No booking ID provided');
            return;
        }

        setIsPolling(true);
        setError(null);
        setPollingAttempt(0);

        try {
            const finalStatus = await pollBookingStatus(bookingId, {
                interval: options.interval || 3000,
                maxAttempts: options.maxAttempts || 10,
                onUpdate: (currentStatus, attempt) => {
                    setStatus(currentStatus);
                    setPollingAttempt(attempt);
                }
            });

            setStatus(finalStatus);
            setIsPolling(false);
            return finalStatus;
        } catch (err) {
            Logger.error('Polling failed:', err);
            setError(err.message);
            setIsPolling(false);
            throw err;
        }
    }, [bookingId]);

    const stopPolling = useCallback(() => {
        setIsPolling(false);
    }, []);

    return {
        status,
        isPolling,
        pollingAttempt,
        error,
        startPolling,
        stopPolling
    };
}
