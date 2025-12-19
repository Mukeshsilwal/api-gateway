/**
 * Auth React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/endpoints/auth.api';
import type {
    LoginRequest,
    AggregatedLoginResponse,
    AggregatedUserDashboard,
    UserDto,
    CreateUserRequest,
} from '@/api/types/auth.types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Query Keys
export const authKeys = {
    all: ['auth'] as const,
    dashboard: (username: string, userId: number) =>
        [...authKeys.all, 'dashboard', username, userId] as const,
    profile: (userId: number) =>
        [...authKeys.all, 'profile', userId] as const,
};

// Queries
export const useDashboard = (username: string, userId: number) => {
    return useQuery({
        queryKey: authKeys.dashboard(username, userId),
        queryFn: () => authApi.getDashboard(username, userId),
        staleTime: 2 * 60 * 1000,
        enabled: !!username && !!userId,
    });
};

export const useProfile = (userId: number) => {
    return useQuery({
        queryKey: authKeys.profile(userId),
        queryFn: () => authApi.getProfile(userId),
        staleTime: 5 * 60 * 1000,
        enabled: !!userId,
    });
};

// Mutations
export const useLogin = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
        onSuccess: (data: AggregatedLoginResponse) => {
            // Store auth data
            localStorage.setItem('token', data.authData.accessToken);
            localStorage.setItem('refreshToken', data.authData.refreshToken);
            localStorage.setItem('sessionId', data.authData.sessionId);
            localStorage.setItem('userRoles', JSON.stringify(data.authData.roles));
            localStorage.setItem('userData', JSON.stringify(data.userProfile));

            // Prefetch dashboard
            queryClient.setQueryData(
                authKeys.dashboard(data.userProfile.email, data.userProfile.id),
                {
                    userProfile: data.userProfile,
                    bookingSummary: { totalBookings: 0, activeBookings: 0, completedBookings: 0, cancelledBookings: 0 },
                    activeSessions: [],
                    recentActivity: [],
                    preferences: data.userPreferences,
                }
            );

            toast.success('Login successful!');

            const primaryRole = data.authData.roles[0];
            if (primaryRole === 'ADMIN' || primaryRole === 'SUPER_ADMIN') {
                navigate('/admin/panel');
            } else {
                navigate('/home');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Login failed');
        },
    });
};

export const useLogout = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sessionId: string) => authApi.logout(sessionId),
        onSuccess: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('sessionId');
            localStorage.removeItem('userRoles');
            localStorage.removeItem('userData');
            queryClient.clear();
            toast.success('Logged out successfully');
            navigate('/login');
        },
        onError: () => {
            localStorage.clear();
            queryClient.clear();
            navigate('/login');
        },
    });
};

export const useRegister = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (userData: CreateUserRequest) => authApi.register(userData),
        onSuccess: () => {
            toast.success('Registration successful! Please login.');
            navigate('/login');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Registration failed');
        },
    });
};

export const useUpdateProfile = (userId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData: Partial<UserDto>) => authApi.updateProfile(userId, userData),
        onMutate: async (newData) => {
            await queryClient.cancelQueries({ queryKey: authKeys.profile(userId) });
            const previousProfile = queryClient.getQueryData<UserDto>(authKeys.profile(userId));

            if (previousProfile) {
                queryClient.setQueryData<UserDto>(authKeys.profile(userId), {
                    ...previousProfile,
                    ...newData,
                });
            }

            return { previousProfile };
        },
        onError: (err, newData, context) => {
            if (context?.previousProfile) {
                queryClient.setQueryData(authKeys.profile(userId), context.previousProfile);
            }
            toast.error('Failed to update profile');
        },
        onSuccess: () => {
            toast.success('Profile updated successfully');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.profile(userId) });
        },
    });
};
