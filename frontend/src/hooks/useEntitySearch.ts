import { useState, useEffect, useCallback } from 'react';
import { adminApi, SearchResultItem } from '../api/admin';

export const useEntitySearch = (query: string, enabled: boolean = true) => {
    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || query.length < 2) {
            setResults([]);
            return;
        }

        const controller = new AbortController();
        const signal = controller.signal;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await adminApi.searchEntities(query, signal);
                setResults(data);
            } catch (err: any) {
                if (err.name === 'AbortError') return;
                setError(err.message || 'Search failed');
                setResults([]);
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        };

        // Debounce 300ms
        const timeoutId = setTimeout(fetchData, 300);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [query, enabled]);

    return { results, loading, error };
};
