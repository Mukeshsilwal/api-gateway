-- Performance Optimization Indexes for Trip Service
-- Migration: V3__performance_indexes.sql
-- Description: Add indexes to improve query performance for trip booking queries
-- Simplified version - only creates indexes on existing tables/columns

-- ============================================================================
-- TRIP BOOKING INDEXES
-- ============================================================================

-- Index for trip_id lookups
-- Supports: findByTripTripId queries
CREATE INDEX IF NOT EXISTS idx_trip_booking_trip_id 
ON trip_bookings(trip_id, created_at DESC);

-- Composite index for booking type + booking ID lookups
-- Supports: findByBookingTypeAndBookingId queries
CREATE INDEX IF NOT EXISTS idx_trip_booking_type_id 
ON trip_bookings(booking_type, booking_id);

-- Index for booking status
CREATE INDEX IF NOT EXISTS idx_trip_booking_status 
ON trip_bookings(status);

-- Index for booking reference
CREATE INDEX IF NOT EXISTS idx_trip_booking_reference 
ON trip_bookings(booking_reference);

-- ============================================================================
-- TRIP INDEXES
-- ============================================================================

-- Composite index for user trips ordered by creation
-- Supports: user trip history queries
CREATE INDEX IF NOT EXISTS idx_trip_user_created 
ON trips(user_id, created_at DESC);

-- Index for trip status
CREATE INDEX IF NOT EXISTS idx_trip_status 
ON trips(status) 
WHERE status IS NOT NULL;

-- Index for trip dates
CREATE INDEX IF NOT EXISTS idx_trip_dates 
ON trips(start_date, end_date);
