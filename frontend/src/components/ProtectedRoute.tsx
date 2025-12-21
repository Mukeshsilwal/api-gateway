import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
    redirectTo?: string | null;
}

/**
 * Protected Route Component - Role-based route protection
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [], redirectTo = null }) => {
    const location = useLocation();
    const isAuthenticated = authService.isAuthenticated();
    const userRole = authService.getRole();

    // Debug logging
    console.log('[ProtectedRoute] Check:', {
        path: location.pathname,
        isAuthenticated,
        userRole,
        allowedRoles,
        token: localStorage.getItem('token') ? 'present' : 'missing',
        storedRole: localStorage.getItem('userRole')
    });

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        console.warn('[ProtectedRoute] Not authenticated, redirecting to login');

        // Determine which login page based on current path
        let loginPath = '/';
        if (location.pathname.startsWith('/admin')) {
            loginPath = '/admin/login';
        } else if (location.pathname.startsWith('/super-admin')) {
            loginPath = '/super-admin/login';
        }

        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Authenticated but no role restrictions - allow access
    if (allowedRoles.length === 0) {
        console.log('[ProtectedRoute] No role restrictions, allowing access');
        return <>{children}</>;
    }

    // Check if user has required role
    const hasAccess = authService.hasRole(allowedRoles);

    if (!hasAccess) {
        console.warn('[ProtectedRoute] Access denied - insufficient permissions');
        // User doesn't have required role - redirect
        const defaultRedirect = redirectTo || authService.getDefaultRedirect();
        return <Navigate to={defaultRedirect} replace />;
    }

    console.log('[ProtectedRoute] Access granted');
    // User has required role - render children
    return <>{children}</>;
};

export default ProtectedRoute;
