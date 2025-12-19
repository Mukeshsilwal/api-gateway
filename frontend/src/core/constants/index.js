// Core Constants - Centralized application constants
// This prevents typos and makes refactoring easier

// User Roles
export const ROLES = {
    USER: 'USER',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
    ORGANIZER: 'ORGANIZER',
    SUPPORT: 'SUPPORT'
};

// Permissions
export const PERMISSIONS = {
    BOOK_TICKET: 'BOOK_TICKET',
    VIEW_ALL_EVENTS: 'VIEW_ALL_EVENTS',
    CREATE_EVENT: 'CREATE_EVENT',
    MANAGE_EVENT: 'MANAGE_EVENT',
    VIEW_BOOKINGS: 'VIEW_BOOKINGS',
    MANAGE_USERS: 'MANAGE_USERS',
    MANAGE_ROLES: 'MANAGE_ROLES',
    MANAGE_REFUNDS: 'MANAGE_REFUNDS'
};

// Role Permissions Mapping
export const ROLE_PERMISSIONS = {
    [ROLES.USER]: [
        PERMISSIONS.BOOK_TICKET,
        PERMISSIONS.VIEW_ALL_EVENTS
    ],
    [ROLES.ORGANIZER]: [
        PERMISSIONS.VIEW_ALL_EVENTS,
        PERMISSIONS.CREATE_EVENT,
        PERMISSIONS.MANAGE_EVENT,
        PERMISSIONS.VIEW_BOOKINGS
    ],
    [ROLES.ADMIN]: [
        PERMISSIONS.BOOK_TICKET,
        PERMISSIONS.VIEW_ALL_EVENTS,
        PERMISSIONS.CREATE_EVENT,
        PERMISSIONS.MANAGE_EVENT,
        PERMISSIONS.VIEW_BOOKINGS,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.MANAGE_REFUNDS
    ],
    [ROLES.SUPPORT]: [
        PERMISSIONS.VIEW_ALL_EVENTS,
        PERMISSIONS.VIEW_BOOKINGS,
        PERMISSIONS.MANAGE_REFUNDS
    ],
    [ROLES.SUPER_ADMIN]: [
        // Grants all permissions
        ...Object.values(PERMISSIONS),
        PERMISSIONS.MANAGE_ROLES
    ]
};

// Application Routes
export const ROUTES = {
    // Public Routes
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',

    // User Routes
    USER_DASHBOARD: '/dashboard',
    USER_BOOKINGS: '/my-bookings',
    USER_PROFILE: '/profile',

    // Admin Routes
    ADMIN_LOGIN: '/admin/login',
    ADMIN_REGISTER: '/admin/register',
    ADMIN_PANEL: '/admin/panel',
    ADMIN_TRANSPORT: '/admin/transport',
    ADMIN_ROUTES: '/admin/routes',
    ADMIN_BOOKINGS: '/admin/bookings',

    // Super Admin Routes
    SUPER_ADMIN_LOGIN: '/super-admin/login',
    SUPER_ADMIN_PANEL: '/super-admin/panel',

    // Booking Routes
    BUS_LIST: '/buslist',
    PLANE_LIST: '/plane-list',
    TICKET_DETAILS: '/ticket-details',
    TICKET_CONFIRM: '/ticket-confirm',

    // QFX Routes
    QFX_MOVIES: '/qfx/movies',
    QFX_MOVIE_DETAILS: '/qfx/movie/:id',
    QFX_SEATS: '/qfx/seats/:showtimeId',
    QFX_CONFIRMATION: '/qfx/confirmation'
};

// Booking Types
export const BOOKING_TYPES = {
    BUS: 'bus',
    FLIGHT: 'flight',
    HOTEL: 'hotel',
    MOVIE: 'movie'
};

// Booking Status
export const BOOKING_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed'
};

// Payment Providers
export const PAYMENT_PROVIDERS = {
    ESEWA: 'esewa',
    KHALTI: 'khalti',
    IME_PAY: 'imepay'
};

// Payment Status
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

// API Status
export const API_STATUS = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
};

// Local Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER_ROLE: 'userRole',
    USER_DATA: 'userData',
    THEME: 'theme',
    LANGUAGE: 'language'
};

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to access this resource.',
    SESSION_EXPIRED: 'Your session has expired. Please login again.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    NOT_FOUND: 'The requested resource was not found.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful!',
    LOGOUT_SUCCESS: 'Logged out successfully.',
    BOOKING_SUCCESS: 'Booking confirmed successfully!',
    PAYMENT_SUCCESS: 'Payment completed successfully!',
    UPDATE_SUCCESS: 'Updated successfully!',
    DELETE_SUCCESS: 'Deleted successfully!'
};

// Validation Rules
export const VALIDATION = {
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 50,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
    PHONE_REGEX: /^[0-9]{10}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};

// Date Formats
export const DATE_FORMATS = {
    DISPLAY: 'MMM DD, YYYY',
    API: 'YYYY-MM-DD',
    DATETIME: 'MMM DD, YYYY HH:mm',
    TIME: 'HH:mm'
};
