/**
 * React Query Provider Setup
 */

import { QueryClient, QueryClientProvider } from '@tantml:query/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 1,
        },
    },
});

interface QueryProviderProps {
    children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => (
    <QueryClientProvider client={queryClient}>
        {children}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
);

export { queryClient };
