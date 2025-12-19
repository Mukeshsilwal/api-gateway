/**
 * Auth API Client
 * Base Path: /api/bff/v1/auth
 */

import client from '../client';
import type {
    ApiResponse,
    LoginRequest,
    AggregatedLoginResponse,
    LogoutResponse,
    CreateUserRequest,
    UserDto,
    RefreshTokenResponse,
    AggregatedUserDashboard,
    ChangePasswordRequest,
    SessionInfo,
} from '../types/auth.types';

const BASE_PATH = '/bff/v1/auth';

export const authApi = {
    async login(credentials: LoginRequest): Promise<AggregatedLoginResponse> {
        const response = await client.post<ApiResponse<AggregatedLoginResponse>>(
            `${BASE_PATH}/login`,
            credentials
        );
        return response.data.data;
    },

    async logout(sessionId: string): Promise<LogoutResponse> {
        const response = await client.post<ApiResponse<LogoutResponse>>(
            `${BASE_PATH}/logout`,
            {},
            { headers: { 'Session-Id': sessionId } }
        );
        return response.data.data;
    },

    async getDashboard(username: string, userId: number): Promise<AggregatedUserDashboard> {
        const response = await client.get<ApiResponse<AggregatedUserDashboard>>(
            `${BASE_PATH}/dashboard`,
            {
                headers: {
                    Username: username,
                    'User-Id': userId.toString(),
                },
            }
        );
        return response.data.data;
    },

    async getProfile(userId: number): Promise<UserDto> {
        const response = await client.get<ApiResponse<UserDto>>(
            `${BASE_PATH}/profile/${userId}`
        );
        return response.data.data;
    },

    async updateProfile(userId: number, userData: Partial<UserDto>): Promise<UserDto> {
        const response = await client.put<ApiResponse<UserDto>>(
            `${BASE_PATH}/profile/${userId}`,
            userData
        );
        return response.data.data;
    },

    async register(userData: CreateUserRequest): Promise<UserDto> {
        const response = await client.post<ApiResponse<UserDto>>(
            `${BASE_PATH}/register`,
            userData
        );
        return response.data.data;
    },

    async refreshToken(refreshToken: string, sessionId: string): Promise<RefreshTokenResponse> {
        const response = await client.post<ApiResponse<RefreshTokenResponse>>(
            `${BASE_PATH}/refresh`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                    'Session-Id': sessionId,
                },
            }
        );
        return response.data.data;
    },

    async changePassword(data: ChangePasswordRequest): Promise<void> {
        await client.post(`/bff/v1/registration/change-password`, data);
    },

    async sendOTP(username: string): Promise<void> {
        await client.post(`/bff/v1/registration/send-otp`, { username });
    },

    async logoutAll(username: string): Promise<{ message: string; sessionsTerminated: number }> {
        const response = await client.post<ApiResponse<{ message: string; sessionsTerminated: number }>>(
            `${BASE_PATH}/logout-all`,
            {},
            { headers: { Username: username } }
        );
        return response.data.data;
    },

    async getActiveSessions(username: string): Promise<SessionInfo[]> {
        const response = await client.get<ApiResponse<{ sessions: SessionInfo[] }>>(
            `${BASE_PATH}/sessions/active`,
            { headers: { Username: username } }
        );
        return response.data.data.sessions;
    },

    async getUserActivity(username: string): Promise<any> {
        const response = await client.get<ApiResponse<any>>(
            `${BASE_PATH}/activity/${username}`
        );
        return response.data.data;
    },

    async getOnlineUserCount(): Promise<number> {
        const response = await client.get<ApiResponse<number>>(
            `${BASE_PATH}/users/online/count`
        );
        return response.data.data;
    },

    async getOnlineUsers(): Promise<string[]> {
        const response = await client.get<ApiResponse<string[]>>(
            `${BASE_PATH}/users/online`
        );
        return response.data.data;
    },

    async validateSession(sessionId: string, token: string): Promise<any> {
        const response = await client.get<ApiResponse<any>>(
            `${BASE_PATH}/session/validate`,
            {
                headers: {
                    'Session-Id': sessionId,
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data.data;
    },

    async registerAdmin(formData: FormData): Promise<any> {
        const response = await client.post<ApiResponse<any>>(
            `${BASE_PATH}/register/admin`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data.data;
    },
};
