import { useQuery } from '@tanstack/react-query';
import { adminApi, AdminSummary } from '../api/admin';

export const useAdminSummary = (
    window: '7d' | '30d' | '90d' = '30d',
    tz: string = 'Asia/Kathmandu'
) => {
    return useQuery<AdminSummary | null>({
        queryKey: ['admin-summary', { window, tz }],
        queryFn: async () => {
            const data = await adminApi.getSummary(window, tz);
            return data ?? null;
        },
        staleTime: 30_000, // 30s
        gcTime: 300_000, // 5m
        retry: 2,
        refetchOnWindowFocus: false,
    });
};
