import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from '../services/analytics';

/**
 * Custom Hook to track page views on route change.
 * Should be used once in the main App component or a top-level layout.
 */
const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        // Track the current path
        const currentPath = location.pathname + location.search;
        analytics.trackPageView(currentPath);
    }, [location]);
};

export default usePageTracking;
