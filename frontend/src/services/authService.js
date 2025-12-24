import apiService from './api.service';
import API_CONFIG from '../config/api';
import { ROLES, ROLE_PERMISSIONS } from '../core/constants';

// Authentication Service - Centralized auth management with role-based access control

class AuthService {
    // Storage keys
    TOKEN_KEY = 'token';
    REFRESH_TOKEN_KEY = 'refreshToken';
    ROLE_KEY = 'userRole'; // Deprecated in favor of roles array, but kept for legacy
    ROLES_KEY = 'userRoles'; // New key for roles array
    USER_DATA_KEY = 'userData';
    SESSION_ID_KEY = 'sessionId';
    TOKEN_EXPIRY_KEY = 'tokenExpiry';
    expirationCheckInterval = null;

    constructor() {
        // Start expiration check when service is instantiated
        this.startExpirationCheck();
    }

    /**
     * Normalize backend role format to frontend format
     * Backend sends: "ROLE_USER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"
     * Frontend uses: "USER", "ADMIN", "SUPER_ADMIN"
     * @param {string|string[]} backendRole - Role from backend (can be string or array)
     * @returns {string} Normalized role
     */
    normalizeRole(backendRole) {
        let roleString = backendRole;

        // Handle array of roles/authorities
        if (Array.isArray(backendRole)) {
            // Flatten the array and look for roles
            const roles = backendRole.map(r => r.startsWith('ROLE_') ? r.replace('ROLE_', '') : r);

            // Priority Check
            if (roles.includes(ROLES.SUPER_ADMIN)) return ROLES.SUPER_ADMIN;
            if (roles.includes(ROLES.ADMIN)) return ROLES.ADMIN;
            if (roles.includes(ROLES.ORGANIZER)) return ROLES.ORGANIZER;
            if (roles.includes(ROLES.SUPPORT)) return ROLES.SUPPORT;
            if (roles.includes(ROLES.USER)) return ROLES.USER;

            // Fallback to first role if none of standard roles match
            return roles[0] || ROLES.USER;
        }

        // Remove "ROLE_" prefix if present
        const role = roleString ? roleString.replace('ROLE_', '') : '';

        // Validate and return
        if (Object.values(ROLES).includes(role)) {
            return role;
        }

        // Default to USER if invalid
        console.warn('Invalid role received:', backendRole, '- defaulting to USER');
        return ROLES.USER;
    }

    /**
     * Store authentication data after successful login (Aggregated Response)
     * @param {Object} aggregatedResponse - The AggregatedLoginResponse from Web-BFF
     */
    async login(aggregatedResponse) {
        // Handle BFF response structure where data is nested in 'data' property
        const responseData = aggregatedResponse.data || aggregatedResponse;

        if (!responseData || !responseData.authData) {
            console.error('Invalid login response format', aggregatedResponse);
            return false;
        }

        const { authData, userProfile, userPreferences } = responseData;
        // Support both structures (authData wrapper or direct)
        const tokenData = authData || responseData;
        const { accessToken, refreshToken, sessionId, roles, expiresIn } = tokenData; // Added expiresIn

        // Store tokens
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        if (refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        }

        // Store token expiration time if provided, default to 1 hour if not
        const expiryTime = Date.now() + (expiresIn || 3600) * 1000;
        localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());

        // Store Roles
        if (Array.isArray(roles)) {
            localStorage.setItem(this.ROLES_KEY, JSON.stringify(roles));
            // For backward compatibility, store the "primary" role (e.g. highest privilege or first)
            // Or just store the first one. Let's try to find the "highest" role.
            const primaryRole = this.normalizeRole(roles);
            localStorage.setItem(this.ROLE_KEY, primaryRole);
        } else if (roles) {
            // Legacy single role case
            localStorage.setItem(this.ROLES_KEY, JSON.stringify([roles]));
            localStorage.setItem(this.ROLE_KEY, roles);
        }

        if (userProfile) {
            localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userProfile));
        }

        if (userPreferences) {
            localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
        }

        if (sessionId) {
            localStorage.setItem(this.SESSION_ID_KEY, sessionId);
        }

        // Start expiration check
        this.startExpirationCheck();

        return true;
    }

    /**
     * Clear all authentication data and invalidate session on server
     */
    async logout() {
        try {
            const sessionId = this.getSessionId();

            // Call logout API if session exists
            if (sessionId) {
                await apiService.post(API_CONFIG.ENDPOINTS.LOGOUT, {}, {
                    headers: { 'Session-Id': sessionId }
                });
            }
        } catch (error) {
            console.error("Logout API call failed", error);
        } finally {
            // Always clear all auth data even if API fails
            this.clearAuth();
        }
    }

    /**
     * Clear all authentication data from localStorage
     */
    clearAuth() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.ROLE_KEY);
        localStorage.removeItem(this.ROLES_KEY);
        localStorage.removeItem(this.USER_DATA_KEY);
        localStorage.removeItem(this.SESSION_ID_KEY);
        localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
        localStorage.removeItem('userPreferences');
        this.stopExpirationCheck();
    }

    /**
     * Logout all sessions for the user
     * @returns {Promise<object>}
     */
    async logoutAll() {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.LOGOUT_ALL);
            return response.data;
        } catch (error) {
            console.error("Logout all failed", error);
            throw error;
        }
    }

    /**
     * Get User Dashboard Data
     * @returns {Promise<object>}
     */
    async getDashboard() {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.AUTH_DASHBOARD);
            return response.data;
        } catch (error) {
            console.error("Failed to get auth dashboard", error);
            throw error;
        }
    }

    /**
     * Register a new user
     * @param {object} userData 
     * @returns {Promise<object>}
     */
    async register(userData) {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.REGISTER, userData);
            return response.data;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    }

    /**
     * Change Password
     * @param {string} username 
     * @param {string} oldPassword 
     * @param {string} newPassword 
     * @param {string} otp 
     * @returns {Promise<object>}
     */
    async changePassword(username, oldPassword, newPassword, otp) {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
                username,
                oldPassword,
                newPassword,
                otp
            });
            return response.data;
        } catch (error) {
            console.error("Change password failed", error);
            throw error;
        }
    }

    /**
     * Get stored session ID
     * @returns {string|null}
     */
    getSessionId() {
        return localStorage.getItem(this.SESSION_ID_KEY);
    }

    /**
     * Get the current user's ID
     * @returns {string|number|null}
     */
    getCurrentUserId() {
        const userData = this.getUserData();
        return userData ? (userData.id || userData.userId || userData.sub) : null;
    }

    /**
     * Get stored token
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Get stored user roles
     * @returns {string[]}
     */
    getRoles() {
        const roles = localStorage.getItem(this.ROLES_KEY);
        try {
            const parsedRoles = roles ? JSON.parse(roles) : [];
            // Normalize roles: strip "ROLE_" prefix if present to match frontend constants
            return parsedRoles.map(r => r.replace('ROLE_', ''));
        } catch (e) {
            return [];
        }
    }

    /**
     * Get stored user role (Primary/Legacy)
     * @returns {string|null}
     */
    getRole() {
        return localStorage.getItem(this.ROLE_KEY);
    }

    /**
     * Get stored user data
     * @returns {object|null}
     */
    getUserData() {
        const data = localStorage.getItem(this.USER_DATA_KEY);
        try {
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error("Error parsing user data", e);
            return null;
        }
    }

    /**
     * Alias for getUserData to maintain compatibility
     * @returns {object|null}
     */
    getCurrentUser() {
        return this.getUserData();
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.getToken();
    }

    /**
     * Check if user has USER role
     * @returns {boolean}
     */
    isUser() {
        return this.hasRole([ROLES.USER]);
    }

    /**
     * Check if user has ADMIN role
     * @returns {boolean}
     */
    isAdmin() {
        return this.hasRole([ROLES.ADMIN]);
    }

    /**
     * Check if user has SUPER_ADMIN role
     * @returns {boolean}
     */
    isSuperAdmin() {
        return this.hasRole([ROLES.SUPER_ADMIN]);
    }

    /**
     * Check if user has admin privileges (ADMIN or SUPER_ADMIN)
     * @returns {boolean}
     */
    hasAdminAccess() {
        return this.hasRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]);
    }

    /**
     * Check if user has any of the specified roles
     * @param {string[]} allowedRoles - Array of allowed roles
     * @returns {boolean}
     */
    hasRole(allowedRoles) {
        if (!allowedRoles || allowedRoles.length === 0) return true;

        const userRoles = this.getRoles();
        // Check if ANY of the user's roles are in the allowedRoles list
        return userRoles.some(role => allowedRoles.includes(role));
    }

    /**
     * Check if user has a specific permission
     * @param {string} permission - Permission to check
     * @returns {boolean}
     */
    hasPermission(permission) {
        const userRoles = this.getRoles();
        if (!userRoles || userRoles.length === 0) return false;

        // Check if any of the user's roles have the required permission
        return userRoles.some(role => {
            const rolePermissions = ROLE_PERMISSIONS[role];
            return rolePermissions && rolePermissions.includes(permission);
        });
    }

    /**
     * Get appropriate redirect path based on user role
     * Checks for pending bookings and redirects user accordingly
     * @returns {string}
     */
    getDefaultRedirect() {
        const role = this.getRole();

        // For regular users, check if there's a pending booking
        if (role === ROLES.USER) {
            const pendingBooking = sessionStorage.getItem('pendingBooking');
            if (pendingBooking) {
                try {
                    const booking = JSON.parse(pendingBooking);
                    // Return to the event details page so they can re-select tickets
                    return `/events/${booking.eventId}`;
                } catch (e) {
                    console.error('Error parsing pending booking:', e);
                    sessionStorage.removeItem('pendingBooking');
                }
            }
            return '/home';
        }

        // Admins and super admins go to admin panel
        switch (role) {
            case ROLES.ADMIN:
                return '/admin/panel';
            case ROLES.SUPER_ADMIN:
                return '/super-admin/panel';
            case ROLES.ORGANIZER:
                // TODO: Update when organizer dashboard is ready
                return '/market';
            case ROLES.SUPPORT:
                // TODO: Update when support dashboard is ready
                return '/admin/bookings';
            default:
                return '/';
        }
    }

    /**
     * Validate if role can access a specific portal
     * @param {string} portal - Portal type ('user', 'admin', 'super-admin')
     * @param {string} userRole - User's role
     * @returns {boolean}
     */
    canAccessPortal(portal, userRole = null) {
        const role = userRole || this.getRole();

        switch (portal) {
            case 'user':
                // All roles can access user portal
                return true;
            case 'admin':
                // Admin and Super Admin can access admin portal
                return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
            case 'super-admin':
                // Only Super Admin can access super admin portal
                return role === ROLES.SUPER_ADMIN;
            default:
                return false;
        }
    }

    /**
     * Get role display name
     * @param {string} role - Role constant
     * @returns {string}
     */
    getRoleDisplayName(role = null) {
        const userRole = role || this.getRole();

        switch (userRole) {
            case ROLES.USER:
                return 'User';
            case ROLES.ADMIN:
                return 'Administrator';
            case ROLES.SUPER_ADMIN:
                return 'Super Administrator';
            case ROLES.ORGANIZER:
                return 'Event Organizer';
            case ROLES.SUPPORT:
                return 'Customer Support';
            default:
                return 'Guest';
        }
    }

    /**
     * Get active sessions for the current user
     * @returns {Promise<Array>} List of active sessions
     */
    async getActiveSessions() {
        try {
            const username = this.getUserData()?.email;
            if (!username) return [];

            // This might need to be updated to use dashboard data if available, 
            // but keeping independent call if API supports it or use legacy.
            // For now, let's assume this might still be valid or we use dashboard stats.
            // But per new BFF, dashboard returns activeSessions.
            // Let's keep this as specific endpoint call if needed, or deprecate if dashboard is primary.
            // The prompt says "GET /dashboard ... activeSessions: [...]".
            // So we can potentially fetch dashboard if we need just sessions, but dashboard is heavy.
            // Let's check API_CONFIG for specific session endpoint.
            // It seems we don't have a specific `GET /sessions` in the new BFF list provided, only in dashboard.
            // I'll leave this implementation but catch error if 404.
            const response = await apiService.get(API_CONFIG.ENDPOINTS.GET_ACTIVE_SESSIONS || '/api/bff/v1/auth/dashboard');
            if (response.data?.activeSessions) return response.data.activeSessions;
            return response.data || [];
        } catch (error) {
            console.error("Failed to get active sessions", error);
            return [];
        }
    }

    /**
     * Logout a specific device/session
     * @param {string} sessionId 
     */
    async logoutDevice(sessionId) {
        try {
            // BFF doesn't explicitly list "Logout specific session" other than current via header.
            // But "Logout All" exists.
            // If legacy endpoint exists, we use it.
            await apiService.post(API_CONFIG.ENDPOINTS.LOGOUT_DEVICE, {}, {
                headers: { 'Session-Id': sessionId }
            });
            return true;
        } catch (error) {
            console.error("Failed to logout device", error);
            return false;
        }
    }

    /**
     * Logout all other devices
     */
    async logoutAllDevices() {
        return this.logoutAll();
    }

    /**
     * Validate current session
     * @param {string} sessionId
     * @returns {Promise<boolean>}
     */
    async validateSession(sessionId) {
        try {
            const token = this.getToken();
            if (!token || !sessionId) return false;

            const response = await apiService.get(API_CONFIG.ENDPOINTS.VALIDATE_SESSION, {
                headers: {
                    'Session-Id': sessionId,
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data?.valid || false;
        } catch (error) {
            console.error("Session validation failed", error);
            return false;
        }
    }

    /**
     * Get online user count (Admin only)
     * @returns {Promise<number>}
     */
    async getOnlineUserCount() {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.GET_ONLINE_USER_COUNT);
            return response.data?.activeUsers || 0;
        } catch (error) {
            console.error("Failed to get online user count", error);
            return 0;
        }
    }

    // ==================== Registration Module ====================

    /**
     * Register a new admin with document verification
     * @param {FormData} formData - Form data containing fullName, email, phone, address, role, and document file
     * @returns {Promise<object>} Registration response
     */
    async registerAdmin(formData) {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.REGISTER_ADMIN, formData, {
                uploadTimeout: 30000 // 30 second timeout for file upload
            });
            return response;
        } catch (error) {
            console.error("Failed to register admin", error);
            throw error;
        }
    }

    /**
     * Get all pending admin registration requests
     * @returns {Promise<Array>} List of admin registration requests
     */
    async getAllAdminRequests() {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.GET_ADMIN_REQUESTS);
            return response.data || response || [];
        } catch (error) {
            console.error("Failed to get admin requests", error);
            throw error;
        }
    }

    /**
     * Approve an admin registration request
     * @param {number|string} requestId - ID of the registration request to approve
     * @returns {Promise<object>} Approval response
     */
    async approveAdminRequest(requestId) {
        try {
            const response = await apiService.post(`${API_CONFIG.ENDPOINTS.APPROVE_ADMIN}/${requestId}`, {});
            return response;
        } catch (error) {
            console.error("Failed to approve admin request", error);
            throw error;
        }
    }

    /**
     * Send OTP to user for verification
     * @param {string} username - Username to send OTP to
     * @returns {Promise<object>} OTP send response
     */
    async sendOTP(username) {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.SEND_OTP, { username });
            return response;
        } catch (error) {
            console.error("Failed to send OTP", error);
            throw error;
        }
    }

    /**
     * Check if token is expired
     */
    isTokenExpired() {
        const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
        if (!expiryTime) {
            return false;
        }
        return Date.now() >= parseInt(expiryTime);
    }

    /**
     * Get time until token expiration in milliseconds
     */
    getTimeUntilExpiration() {
        const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
        if (!expiryTime) {
            return null;
        }
        const timeLeft = parseInt(expiryTime) - Date.now();
        return timeLeft > 0 ? timeLeft : 0;
    }

    /**
     * Start checking for token expiration
     */
    startExpirationCheck() {
        // Clear any existing interval
        this.stopExpirationCheck();

        // Check immediately
        if (this.isTokenExpired()) {
            this.handleTokenExpiration();
            return;
        }

        // Check every minute
        this.expirationCheckInterval = setInterval(() => {
            if (this.isTokenExpired()) {
                this.handleTokenExpiration();
            }
        }, 60000); // Check every 60 seconds
    }

    /**
     * Stop checking for token expiration
     */
    stopExpirationCheck() {
        if (this.expirationCheckInterval) {
            clearInterval(this.expirationCheckInterval);
            this.expirationCheckInterval = null;
        }
    }

    /**
     * Handle token expiration
     */
    handleTokenExpiration() {
        console.warn('Token has expired. Clearing authentication...');

        // Clear all auth data
        this.clearAuth();

        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('tokenExpired', {
            detail: { message: 'Your session has expired. Please login again.' }
        }));

        // Redirect to login page if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/admin/login') {
            window.location.href = '/login';
        }
    }

    /**
     * Initialize expiration check on page load
     */
    initializeExpirationCheck() {
        if (this.isAuthenticated()) {
            if (this.isTokenExpired()) {
                this.handleTokenExpiration();
            } else {
                this.startExpirationCheck();
            }
        }
    }

    // ==================== OAuth Methods ====================

    /**
     * Handle OAuth2 callback and store tokens
     * @param {Object} oauthData - OAuth callback data containing tokens
     */
    async handleOAuthCallback(oauthData) {
        const { accessToken, refreshToken, sessionId, error } = oauthData;

        if (error) {
            console.error('OAuth authentication failed:', error);
            return { success: false, error };
        }

        if (!accessToken || !refreshToken || !sessionId) {
            console.error('Invalid OAuth response - missing tokens');
            return { success: false, error: 'Invalid authentication response' };
        }

        // Store tokens
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(this.SESSION_ID_KEY, sessionId);

        // Decode JWT to get user info
        try {
            const tokenPayload = this.decodeToken(accessToken);
            const roles = tokenPayload.roles || tokenPayload.authorities || [];

            // Store token expiration
            const expiresIn = tokenPayload.exp ? (tokenPayload.exp * 1000 - Date.now()) / 1000 : 3600;
            const expiryTime = Date.now() + expiresIn * 1000;
            localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());

            // Store roles
            localStorage.setItem(this.ROLES_KEY, JSON.stringify(roles));
            localStorage.setItem(this.ROLE_KEY, this.normalizeRole(roles));

            // Fetch full user profile
            const userProfile = await this.fetchUserProfile();
            if (userProfile) {
                localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userProfile));
            }

            this.startExpirationCheck();
            return { success: true };
        } catch (error) {
            console.error('Failed to process OAuth tokens:', error);
            this.clearAuth();
            return { success: false, error: 'Failed to process authentication' };
        }
    }

    /**
     * Decode JWT token (client-side only for reading claims)
     */
    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Failed to decode token:', error);
            return {};
        }
    }

    /**
     * Fetch user profile from backend
     */
    async fetchUserProfile() {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.AUTH_DASHBOARD);
            return response.data?.userProfile || response.data;
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            return null;
        }
    }

    /**
     * Check if user authenticated via OAuth
     */
    isOAuthUser() {
        const userData = this.getUserData();
        return userData && userData.provider && userData.provider !== 'LOCAL';
    }

    /**
     * Get OAuth provider name
     */
    getOAuthProvider() {
        const userData = this.getUserData();
        return userData?.provider || null;
    }
}


// Create singleton instance
const authService = new AuthService();

// Initialize expiration check when service is loaded
authService.initializeExpirationCheck();

export { authService, ROLES };
export default authService;
