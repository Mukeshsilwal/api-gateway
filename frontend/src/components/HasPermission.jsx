import React from 'react';
import authService from '../services/authService';

/**
 * Component to conditionally render children based on user permissions
 * @param {Object} props
 * @param {string} props.permission - Permission required to view content
 * @param {string} props.fallback - Optional content to show if permission is denied
 * @param {React.ReactNode} props.children - Content to render if permission is granted
 */
const HasPermission = ({ permission, fallback = null, children }) => {
    // If no permission specified, allow access (or maybe block? safe default is block, but here we assume if you use this component you specify a permission)
    if (!permission) {
        console.warn('[HasPermission] No permission specified');
        return fallback;
    }

    const hasAccess = authService.hasPermission(permission);

    if (hasAccess) {
        return <>{children}</>;
    }

    return fallback;
};

export default HasPermission;
