import { useQuery } from '@tanstack/react-query';
import busService from '../services/busService';
import { RouteDto } from '../types/dto';

// Define the shape of the data returned by the API
interface BusStopWithRoutes {
    busStop: {
        id: number;
        name: string;
        latitude?: number;
        longitude?: number;
    };
    routes: RouteDto[];
    routeCount: number;
}

/**
 * Custom hook to fetch and cache bus stops with route information
 * Uses React Query for caching and automatic refetching
 * @returns {Object} Query result with bus stops data
 */
export const useCachedBusStops = () => {
    return useQuery<BusStopWithRoutes[]>({
        queryKey: ['bus-stops'],
        queryFn: async () => {
            const response = await busService.getBusStopsWithRoutes();
            // Handle different response formats
            return (response as any)?.data || response || [];
        },
        staleTime: Infinity, // Bus stops rarely change
        gcTime: Infinity, // Keep in cache forever
        refetchOnWindowFocus: false,
        retry: 2,
    });
};
