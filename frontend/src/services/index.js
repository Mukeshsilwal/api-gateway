/**
 * Centralized API Services Export
 * Import all services from this single file
 */

// Core configuration
export { default as apiClient, API_ENDPOINTS } from '../config/apiConfig';

// Authentication
export { default as authService } from './authService';

// Events
export { default as eventService } from './eventService';

// Bookings
export { default as bookingService } from './bookingService';

// Hotels
export { default as hotelService } from './hotelService';

// Bus
export { default as busService } from './busService';

// Payments
export { default as paymentService } from './paymentService';

// User
export { default as userService } from './userService';

// Admin
export { default as adminService } from './adminService';

// Legacy API service (if needed for backward compatibility)
export { default as apiService } from './api.service';

/**
 * Usage Example:
 * 
 * import { authService, eventService, bookingService } from '@/services';
 * 
 * // Login
 * const response = await authService.login({ email, password });
 * 
 * // Get events
 * const events = await eventService.getEvents();
 * 
 * // Create booking
 * const booking = await bookingService.createBooking(bookingData);
 */
