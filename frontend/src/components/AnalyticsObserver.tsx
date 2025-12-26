import usePageTracking from '../hooks/usePageTracking';

/**
 * AnalyticsObserver
 * This component listens for route changes and triggers page view tracking.
 * It must be placed inside the BrowserRouter context.
 */
const AnalyticsObserver = () => {
    usePageTracking();
    return null; // Renders nothing
};

export default AnalyticsObserver;
