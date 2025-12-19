/**
 * Auth API Type Definitions
 * Generated from: AuthBffController.java
 * Base Path: /api/bff/v1/auth
 */

// ==================== Request Types ====================

export interface LoginRequest {
    username: string;
    password: string;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
}

export interface ChangePasswordRequest {
    username: string;
    oldPassword: string;
    newPassword: string;
    otp: string;
}

// ==================== Response Types ====================

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

export interface UserDto {
    id: number;
    email: string;
    fullName: string;
    phone?: string;
    roles: string[];
    createdAt: string;
    updatedAt?: string;
}

export interface AuthData {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
    roles: string[];
    expiresIn?: number;
}

export interface AggregatedLoginResponse {
    authData: AuthData;
    userProfile: UserDto;
    userPreferences?: Record<string, any>;
    onlineUserCount?: number;
}

export interface LogoutResponse {
    message: string;
    sessionId: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    expiresIn: number;
}

export interface SessionInfo {
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    loginTime: string;
    lastActivity: string;
    current: boolean;
}

export interface BookingSummary {
    totalBookings: number;
    activeBookings: number;
    completedBookings: number;
    cancelledBookings: number;
}

export interface ActivityLog {
    id: number;
    action: string;
    timestamp: string;
    ipAddress?: string;
    details?: string;
}

export interface AggregatedUserDashboard {
    userProfile: UserDto;
    bookingSummary: BookingSummary;
    activeSessions: SessionInfo[];
    recentActivity: ActivityLog[];
    preferences?: Record<string, any>;
}

export interface ApiError {
    message: string;
    code?: string;
    fieldErrors?: Record<string, string>;
    timestamp?: string;
}
