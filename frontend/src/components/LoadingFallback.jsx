import PropTypes from 'prop-types';

/**
 * Loading Fallback Component
 * Used for Suspense fallbacks and async operations
 */
export default function LoadingFallback({ fullScreen = false, message = 'Loading...' }) {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 flex items-center justify-center z-50">
                <div className="text-center">
                    <LoadingSpinner size="large" />
                    <p className="mt-4 text-slate-600 dark:text-slate-300 text-lg">{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12">
            <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-slate-600 dark:text-slate-300">{message}</p>
            </div>
        </div>
    );
}

LoadingFallback.propTypes = {
    fullScreen: PropTypes.bool,
    message: PropTypes.string
};

/**
 * Loading Spinner Component
 */
export function LoadingSpinner({ size = 'medium' }) {
    const sizeClasses = {
        small: 'w-6 h-6 border-2',
        medium: 'w-10 h-10 border-3',
        large: 'w-16 h-16 border-4'
    };

    return (
        <div
            className={`${sizeClasses[size]} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(['small', 'medium', 'large'])
};

/**
 * Skeleton Loader Components
 */
export function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
    );
}

export function SkeletonList({ count = 3 }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

SkeletonList.propTypes = {
    count: PropTypes.number
};

/**
 * Page Loading Skeleton
 */
export function PageLoadingSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="animate-pulse">
                {/* Header Skeleton */}
                <div className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"></div>

                {/* Content Skeleton */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-8"></div>
                    <SkeletonList count={4} />
                </div>
            </div>
        </div>
    );
}
