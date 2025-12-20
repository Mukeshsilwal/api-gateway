const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL,
  BFF_PREFIX: '/api/bff/v1',
  ENDPOINTS: {
    // === Admin BFF ===
    ADMIN_DELETE_BUS_WITH_SEATS: '/api/bff/v1/admin/buses', // + /{busId}/with-seats
    ADMIN_CREATE_ROUTE: '/api/bff/v1/admin/routes/create-with-stops',

    // === Auth BFF ===
    LOGIN: '/api/bff/v1/auth/login',
    REFRESH: '/api/bff/v1/auth/refresh',
    LOGOUT: '/api/bff/v1/auth/logout',
    LOGOUT_ALL: '/api/bff/v1/auth/logout-all',
    AUTH_DASHBOARD: '/api/bff/v1/auth/dashboard',
    REGISTER: '/api/bff/v1/auth/register',
    CHANGE_PASSWORD: '/api/bff/v1/auth/change-password',
    VALIDATE_SESSION: '/api/bff/v1/auth/validate-session', // Assuming exists or kept for compat
    GET_ONLINE_USER_COUNT: '/api/bff/v1/auth/users/online/count', // Legacy support
    // LOGOUT_DEVICE: '/api/bff/v1/auth/logout',
    GET_ACTIVE_SESSIONS: '/api/bff/v1/auth/dashboard',

    // === Booking BFF ===
    BOOKING_COMPLETE_HOTEL: '/api/bff/v1/bookings/complete',
    BOOKING_CREATE: '/api/bff/v1/bookings', // + {category}/{service}
    BOOKING_DETAILS: '/api/bff/v1/bookings/', // + {bookingId}/details
    BOOKING_HISTORY: '/api/bff/v1/bookings/history',
    BOOKING_UPCOMING: '/api/bff/v1/bookings/upcoming',
    BOOKING_INITIATE: '/api/bff/v1/bookings/initiate',
    BOOKING_STATUS: '/api/bff/v1/bookings/', // + {bookingId}/status
    BOOKING_CANCEL: '/api/bff/v1/bookings', // + /{category}/{service}/cancel

    // === Booking Seat BFF ===
    SEAT_BOOKING_COMPLETE: '/api/bff/v1/seat/complete',
    SEAT_BOOKING_DETAILS: '/api/bff/v1/seat/', // + {bookingId}/details

    // === Bus BFF ===
    BUS_COMPLETE_DETAILS: '/api/bff/v1/buses/bus-details', // + {busId}/complete
    BUS_DASHBOARD: '/api/bff/v1/buses/dashboard',

    // === Hotel BFF ===
    HOTEL_CREATE: '/api/bff/v1/hotels/create',
    HOTEL_ADD_ROOM: '/api/bff/v1/hotels/', // + {hotelCode}/rooms
    HOTEL_SEARCH: '/api/bff/v1/hotels/search',

    // === Main BFF ===
    HOME_DATA: '/api/bff/v1/home-data',
    HOME: '/api/bff/v1/home-data', // Legacy alias for backward compatibility

    // === Maintenance BFF ===
    MAINTENANCE_SAVE: '/api/bff/v1/maintenance/save',
    MAINTENANCE_ASSIGN: '/api/bff/v1/maintenance/assign/', // + {maintenanceId}
    MAINTENANCE_GET_BY_ROOM: '/api/bff/v1/maintenance/room/', // + {roomId}

    // === Market BFF ===
    MARKET_LIVE_DASHBOARD: '/api/bff/market/dashboard/live/', // + {eventId}
    MARKET_ORGANIZER_DASHBOARD: '/api/bff/market/dashboard/organizer/', // + {eventId}

    // === Payment BFF ===
    PAYMENT_INITIATE: '/api/bff/v1/payments/initiate', // + /{provider}
    PAYMENT_VERIFY: '/api/bff/v1/payments/verify',
    PAYMENT_TRANSACTION: '/api/bff/v1/payments/transaction/', // + {transactionId}
    PAYMENT_CANCEL: '/api/bff/v1/payments/cancel',
    PAYMENT_VERIFY_DIRECT: '/api/payments/verify', // Direct endpoint as requested

    // === Staff BFF ===
    STAFF_CREATE: '/api/bff/v1/staff/create',
    STAFF_GET_BY_HOTEL: '/api/bff/v1/staff/hotel/', // + {hotelId}
    STAFF_UPDATE_STATUS: '/api/bff/v1/staff/', // + {staffId}/status
    STAFF_WORKLOAD: '/api/bff/v1/staff/', // + {staffId}/workload

    // === Ticket BFF ===
    TICKET_CREATE_WITH_EMAIL: '/api/bff/v1/tickets/create-with-email',
    TICKET_DETAILS: '/api/bff/v1/tickets/', // + {ticketId}/details

    // === Replaced Legacy Endpoints -> BFF ===
    SIGNUP: '/api/bff/v1/auth/register',
    GET_ADMIN_REQUESTS: '/api/bff/v1/admin/requests',
    APPROVE_ADMIN: '/api/bff/v1/admin/approve',
    REGISTER_ADMIN: '/api/bff/v1/admin/register',
    SEND_OTP: '/api/bff/v1/auth/otp/send',
    LOGOUT_ALL_DEVICES: '/api/bff/v1/auth/logout-all',
    PROFILE_COMPLETE: '/api/bff/v1/profile/complete',
    GET_BUS_STOPS: '/api/bff/v1/buses/stops/with-routes',
    CREATE_BUS_STOP: '/api/bff/v1/admin/bus-stops',
    GET_ROUTES: '/api/bff/v1/routes',
    CREATE_ROUTE: '/api/bff/v1/admin/bus/routes',
    SEARCH_BUSES: "/api/bff/v1/buses/search",
    GET_ALL_BUSES: '/api/bff/v1/buses/bus-details',
    CREATE_BUS: '/api/bff/v1/admin/routes',
    CREATE_SEAT: '/api/bff/v1/admin/buses/create-with-seats',
    ADD_SEAT: '/api/bff/v1/admin/seats',
    BOOK_SEAT: '/api/bff/v1/bookings/seats', // Unified seat booking
    CANCEL_TICKET: '/api/bff/v1/bookings/tickets/cancel',
    CREATE_BOOKING: '/api/bff/v1/bookings/create',
    GET_ALL_BOOKINGS: '/api/bff/v1/bookings',
    TICKET_DOWNLOAD: '/api/bff/v1/tickets/download/', // + {ticketId}
    BOOK_TICKET: '/api/bff/v1/bookings/tickets',
    GENERATE_TICKET: '/api/bff/v1/tickets/generate',
    DELETE_TICKET: '/api/bff/v1/tickets',
    BOOKING_CONFIRM: '/api/bff/v1/bookings/confirm',

    // === QFX (Mocked via BFF) ===
    QFX_MOVIES_NOW_SHOWING: '/api/bff/v1/qfx/movies/now-showing',
    QFX_MOVIES_UPCOMING: '/api/bff/v1/qfx/movies/upcoming',
    QFX_MOVIE_DETAILS: '/api/bff/v1/qfx/movies/',
    QFX_CINEMAS: '/api/bff/v1/qfx/cinemas',
    QFX_SHOWTIMES: '/api/bff/v1/qfx/showtimes',
    QFX_SEATS: '/api/bff/v1/qfx/seats/',
    QFX_BOOK_TICKET: '/api/bff/v1/qfx/bookings',
    QFX_CANCEL_BOOKING: '/api/bff/v1/qfx/bookings/cancel',
    QFX_BOOKING_STATUS: '/api/bff/v1/qfx/bookings/',

    // === Hotels ===
    GET_ALL_HOTELS: '/api/bff/v1/hotels',
    GET_HOTEL_BY_ID: '/api/bff/v1/hotels/code/',
    UPDATE_HOTEL: '/api/bff/v1/hotels/',
    HOTEL_DETAILS: '/api/bff/v1/hotels/',
    DELETE_HOTEL: '/api/bff/v1/hotels/',
    BOOK_HOTEL: '/api/bff/v1/bookings/hotel',
    ADD_ROOM_TO_HOTEL: '/api/bff/v1/hotels/',
    GET_ROOMS_BY_HOTEL: '/api/bff/v1/hotels/',
    GET_ROOM_BY_ID: '/api/bff/v1/hotels/rooms/',
    UPDATE_ROOM: '/api/bff/v1/hotels/rooms/',
    DELETE_ROOM: '/api/bff/v1/hotels/rooms/',
    UPDATE_ROOM_MAINTENANCE: '/api/bff/v1/room/',
    ASSIGN_STAFF_TO_ROOM: '/api/bff/v1/room/',
    HOTELS_NEARBY: '/api/bff/v1/find/nearby',
    HOTELS_RECOMMENDATIONS: '/api/bff/v1/find/recommendations',
    HOTELS_FEATURED: '/api/bff/v1/find/featured',
    HOTELS_SEARCH_CITY: '/api/bff/v1/find/city/',
    HOTELS_BY_STARS: '/api/bff/v1/find/by-stars',
    HOTELS_TOP_RATED: '/api/bff/v1/find/top-rated',
    HOTELS_BUDGET: '/api/bff/v1/find/budget',
    HOTELS_CITIES: '/api/bff/v1/find/cities',
    HOTELS_FILTERS: '/api/bff/v1/find/filters',
    HOTELS_CITY_STATS: '/api/bff/v1/find/cities/', // + {city}/stats
    HOTEL_RECOMMENDED_DETAILS: '/api/bff/v1/find/recommended/', // + {hotelId}
    HOTEL_AVAILABILITY: '/api/bff/v1/find/', // + {hotelId}/availability
    GET_RATE_LIMIT_REMAINING: '/api/bff/v1/rate-limit/remaining',
    IMAGE_UPLOAD: '/api/bff/v1/images/upload',
  }
};

export default API_CONFIG;
