import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for infinite scroll pagination
 * @param {Function} fetchMore - Function to call when scrolling to bottom
 * @param {boolean} hasMore - Whether there are more items to load
 * @returns {Object} { page, setPage, loading, setLoading, observerRef }
 */
const useInfiniteScroll = (fetchMore, hasMore) => {
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);

    const handleObserver = useCallback(
        (entries) => {
            const [entry] = entries;

            if (entry.isIntersecting && hasMore && !loading) {
                setLoading(true);
                fetchMore()
                    .then(() => {
                        setPage(prev => prev + 1);
                    })
                    .catch((error) => {
                        console.error('Error loading more items:', error);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            }
        },
        [hasMore, loading, fetchMore]
    );

    useEffect(() => {
        const option = {
            root: null,
            rootMargin: '100px',
            threshold: 0
        };

        observerRef.current = new IntersectionObserver(handleObserver, option);

        const currentLoadMoreRef = loadMoreRef.current;
        if (currentLoadMoreRef) {
            observerRef.current.observe(currentLoadMoreRef);
        }

        return () => {
            if (observerRef.current && currentLoadMoreRef) {
                observerRef.current.unobserve(currentLoadMoreRef);
            }
        };
    }, [handleObserver]);

    const reset = useCallback(() => {
        setPage(1);
        setLoading(false);
    }, []);

    return {
        page,
        setPage,
        loading,
        setLoading,
        loadMoreRef,
        reset
    };
};

export default useInfiniteScroll;
