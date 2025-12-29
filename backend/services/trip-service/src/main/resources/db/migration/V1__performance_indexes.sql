-- Performance Optimization Indexes for Trip Service
-- Migration: V1__performance_indexes.sql
-- Description: Add indexes to improve query performance for trip booking queries
-- Uses CONCURRENTLY to avoid table locks during index creation

-- ============================================================================
-- TRIP BOOKING INDEXES
-- ============================================================================

-- Index for trip_id lookups
-- Supports: findByTripTripId queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trip_booking_trip_id 
ON trip_bookings(trip_id, created_at DESC);

-- Composite index for booking type + booking ID lookups
-- Supports: findByBookingTypeAndBookingId queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trip_booking_type_id 
ON trip_bookings(booking_type, booking_id);

-- Index for user_id queries (via trip relationship)
-- Note: This assumes trips table has user_id column
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trip_booking_user 
ON trip_bookings(user_id) 
WHERE user_id IS NOT NULL;

-- Index for booking status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trip_booking_status 
ON trip_bookings(status);

-- Index for booking reference
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trip_booking_reference 
ON trip_bookings(booking_reference);

-- ============================================================================
-- TRIP INDEXES
-- ============================================================================

-- Composite index for user trips ordered by creation
-- Supports: user trip history queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trip_user_created 
ON trips(user_id, created_at DESC);

-- Index for trip status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trip_status 
ON trips(status) 
WHERE status IS NOT NULL;

-- Index for trip dates
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trip_dates 
ON trips(start_date, end_date);

-- ============================================================================
-- JOURNEY INDEXES (if applicable)
-- ============================================================================

-- Index for journey lookups by trip
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journey_trip_id 
ON journeys(trip_id) 
WHERE trip_id IS NOT NULL;

-- ============================================================================
-- ITINERARY DAY INDEXES (if applicable)
-- ============================================================================

-- Index for itinerary day lookups by trip
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_itinerary_day_trip_id 
ON itinerary_days(trip_id, day_number) 
WHERE trip_id IS NOT NULL;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- After migration, run these queries to verify indexes were created:
-- 
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename IN ('trip_bookings', 'trips', 'journeys', 'itinerary_days')
-- ORDER BY tablename, indexname;
--
-- Check index usage:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE tablename IN ('trip_bookings', 'trips')
-- ORDER BY idx_scan DESC;
