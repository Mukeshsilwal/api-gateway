/**
 * MSW Browser Setup
 * Enables API mocking in development
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// Start worker in development
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK === 'true') {
    worker.start({
        onUnhandledRequest: 'bypass',
    });
}
