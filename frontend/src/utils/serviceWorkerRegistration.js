/**
 * Service Worker Registration Utility
 * Registers and manages the service worker for offline support and caching
 */

export async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            // Wait for page load
            await new Promise(resolve => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', resolve);
                }
            });

            const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/',
            });

            console.log('[SW] Service Worker registered successfully:', registration.scope);

            // Check for updates periodically
            setInterval(() => {
                registration.update();
            }, 60 * 60 * 1000); // Check every hour

            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('[SW] New Service Worker found, installing...');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available
                        console.log('[SW] New version available! Refresh to update.');

                        // Optionally show notification to user
                        if (window.confirm('New version available! Reload to update?')) {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                            window.location.reload();
                        }
                    }
                });
            });

            // Handle controller change
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[SW] Controller changed, reloading page');
                window.location.reload();
            });

            return registration;
        } catch (error) {
            console.error('[SW] Service Worker registration failed:', error);
            return null;
        }
    } else {
        console.warn('[SW] Service Workers are not supported in this browser');
        return null;
    }
}

/**
 * Unregister service worker (for development/testing)
 */
export async function unregisterServiceWorker() {
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
            await registration.unregister();
            console.log('[SW] Service Worker unregistered');
        }
    }
}

/**
 * Check if the app is running standalone (installed as PWA)
 */
export function isPWA() {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
    );
}

/**
 * Get Service Worker registration
 */
export async function getServiceWorkerRegistration() {
    if ('serviceWorker' in navigator) {
        return await navigator.serviceWorker.ready;
    }
    return null;
}

/**
 * Clear all caches
 */
export async function clearAllCaches() {
    if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('[SW] All caches cleared');
    }
}

export default registerServiceWorker;
