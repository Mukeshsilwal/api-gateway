import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import authService from '../authService';
import apiService from '../api.service';
import { ROLES } from '../../core/constants';

vi.mock('../api.service', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
    }
}));

describe('AuthService', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        vi.clearAllMocks();
    });

    describe('Role Normalization', () => {
        it('normalizes backend role string', () => {
            expect(authService.normalizeRole('ROLE_USER')).toBe('USER');
            expect(authService.normalizeRole('ROLE_ADMIN')).toBe('ADMIN');
            expect(authService.normalizeRole('ROLE_SUPER_ADMIN')).toBe('SUPER_ADMIN');
        });

        it('normalizes role array with correct priority', () => {
            expect(authService.normalizeRole(['ROLE_USER', 'ROLE_ADMIN'])).toBe('ADMIN');
            expect(authService.normalizeRole(['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])).toBe('SUPER_ADMIN');
            expect(authService.normalizeRole(['ROLE_USER'])).toBe('USER');
        });
    });

    describe('Authentication State', () => {
        it('identifies unauthenticated user when no token present', () => {
            expect(authService.isAuthenticated()).toBe(false);
            expect(authService.getToken()).toBeNull();
        });

        it('identifies authenticated user when valid token exists', () => {
            localStorage.setItem('token', 'valid-jwt-token');
            expect(authService.isAuthenticated()).toBe(true);
            expect(authService.getToken()).toBe('valid-jwt-token');
        });

        it('identifies admin role correctly', () => {
            localStorage.setItem('token', 'admin-token');
            localStorage.setItem('userRoles', JSON.stringify(['ROLE_ADMIN']));
            localStorage.setItem('userRole', 'ADMIN');

            expect(authService.isAdmin()).toBe(true);
            expect(authService.hasRole('ADMIN')).toBe(true);
            expect(authService.isSuperAdmin()).toBe(false);
        });

        it('identifies regular user role correctly', () => {
            localStorage.setItem('token', 'user-token');
            localStorage.setItem('userRoles', JSON.stringify(['ROLE_USER']));
            localStorage.setItem('userRole', 'USER');

            expect(authService.isAdmin()).toBe(false);
            expect(authService.hasRole('USER')).toBe(true);
        });
    });

    describe('Login & Logout Flow', () => {
        it('handles successful user login and sets storage tokens', async () => {
            const mockResponse = {
                statusCode: 200,
                message: 'Login successful',
                data: {
                    accessToken: 'sample-access-token',
                    refreshToken: 'sample-refresh-token',
                    roles: ['ROLE_USER'],
                    username: 'testuser',
                    userId: 101,
                    sessionId: 'sess-123'
                }
            };

            const result = await authService.login(mockResponse);

            expect(result).toBeDefined();
            expect(localStorage.getItem('token')).toBe('sample-access-token');
            expect(localStorage.getItem('refreshToken')).toBe('sample-refresh-token');
            expect(authService.isAuthenticated()).toBe(true);
        });

        it('clears storage completely on logout', async () => {
            localStorage.setItem('token', 'sample-token');
            localStorage.setItem('refreshToken', 'sample-refresh');
            localStorage.setItem('userRole', 'ADMIN');
            localStorage.setItem('userData', JSON.stringify({ name: 'Admin' }));

            apiService.post.mockResolvedValueOnce({ statusCode: 200 });

            await authService.logout();

            expect(localStorage.getItem('token')).toBeNull();
            expect(localStorage.getItem('refreshToken')).toBeNull();
            expect(localStorage.getItem('userRole')).toBeNull();
            expect(authService.isAuthenticated()).toBe(false);
        });
    });
});
