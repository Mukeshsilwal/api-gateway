import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { adminApi, LiveSnapshot } from '../api/admin';

const SSE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/live/buses/stream` : 'http://localhost:8080/api/live/buses/stream';
const POLLING_INTERVAL = 60000;

export const useLiveBusTracking = (tz: string = 'Asia/Kathmandu') => {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
    const [fallbackMode, setFallbackMode] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Initial SSE Connection
    useEffect(() => {
        if (fallbackMode) return;

        const connectSSE = () => {
            const url = `${SSE_URL}?tz=${encodeURIComponent(tz)}`;
            const es = new EventSource(url, { withCredentials: true });

            es.onopen = () => {
                setStatus('connected');
                console.log('SSE Connected');
            };

            es.onmessage = (event) => {
                try {
                    const data: LiveSnapshot = JSON.parse(event.data);
                    // Update cache for Admin Summary -> Live Tracking
                    // We optimistically update the 'admin-summary' query data if it exists
                    queryClient.setQueriesData({ queryKey: ['admin-summary'] }, (oldData: any) => {
                        if (!oldData) return oldData;
                        return {
                            ...oldData,
                            liveTracking: {
                                gpsActive: true,
                                activeBuses: data.activeBuses
                            }
                        };
                    });
                } catch (err) {
                    console.error('SSE Parse Error', err);
                }
            };

            es.onerror = (_err) => {
                console.error('SSE Connection Error, switching to Polling');
                es.close();
                setStatus('error');
                setFallbackMode(true);
            };

            eventSourceRef.current = es;
        };

        connectSSE();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [fallbackMode, queryClient, tz]);

    // Polling Fallback
    useEffect(() => {
        if (fallbackMode) {
            const fetchSnapshot = async () => {
                // Only fetch if page is visible
                if (document.hidden) {
                    console.log('Page hidden, skipping poll');
                    return;
                }

                try {
                    const data = await adminApi.getLiveSnapshot(tz);
                    queryClient.setQueriesData({ queryKey: ['admin-summary'] }, (oldData: any) => {
                        if (!oldData) return oldData;
                        return {
                            ...oldData,
                            liveTracking: {
                                gpsActive: false, // In polling mode
                                activeBuses: data.activeBuses
                            }
                        };
                    });
                    setStatus('connected'); // Logically connected via polling
                } catch (e) {
                    console.error('Polling failed', e);
                    setStatus('error');
                }
            };

            // Immediate call
            fetchSnapshot();
            pollingRef.current = setInterval(fetchSnapshot, POLLING_INTERVAL);

            // Listen for visibility changes
            const handleVisibilityChange = () => {
                if (!document.hidden) {
                    fetchSnapshot(); // Fetch immediately when tab becomes visible
                }
            };
            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                }
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [fallbackMode, queryClient, tz]);

    return { status, isPolling: fallbackMode };
};
