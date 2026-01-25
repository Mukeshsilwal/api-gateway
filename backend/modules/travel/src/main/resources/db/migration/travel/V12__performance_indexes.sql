-- Performance Optimization Indexes for Travel Service
-- Migration: V12__performance_indexes.sql
-- Description: Add indexes to improve query performance for high-traffic queries
-- Uses CONCURRENTLY to avoid table locks during index creation

-- ============================================================================
-- EVENT BOOKING INDEXES
-- ============================================================================

-- Composite index for user bookings ordered by creation date
-- Supports: findByUserId with ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_event_booking_user_created 
ON event_bookings(user_id, created_at DESC);

-- Index for event_id lookups
-- Supports: findByEventId queries
CREATE INDEX IF NOT EXISTS idx_event_booking_event_id 
ON event_bookings(event_id);

-- Index for booking status queries
-- Supports: findByStatus queries
CREATE INDEX IF NOT EXISTS idx_event_booking_status 
ON event_bookings(status);

-- ============================================================================
-- EVENT INDEXES
-- ============================================================================

-- Composite index for organizer + status queries
-- Supports: queries filtering by organizer and status
CREATE INDEX IF NOT EXISTS idx_event_organizer_status 
ON events(organizer_id, status);

-- Partial index for published events with date
-- Supports: public event searches (most common query)
CREATE INDEX IF NOT EXISTS idx_event_published_date 
ON events(event_date, city) 
WHERE status = 'PUBLISHED';

-- Index for event status
CREATE INDEX IF NOT EXISTS idx_event_status 
ON events(status);

-- ============================================================================
-- ROOM BOOKING INDEXES
-- ============================================================================

-- Composite index for room availability checks
-- Supports: date range overlap queries
CREATE INDEX IF NOT EXISTS idx_room_booking_availability 
ON room_bookings(room_id, status, check_in, check_out)
WHERE status != 'CANCELLED';

-- Index for customer bookings
CREATE INDEX IF NOT EXISTS idx_room_booking_customer 
ON room_bookings(customer_id, created_at DESC);

-- Index for booking reference lookups
CREATE INDEX IF NOT EXISTS idx_room_booking_reference 
ON room_bookings(booking_reference);

-- ============================================================================
-- ROOM INDEXES
-- ============================================================================

-- Partial index for active rooms by hotel
-- Supports: findAvailableRooms queries
CREATE INDEX IF NOT EXISTS idx_room_hotel_active 
ON rooms(hotel_id, room_type, base_price) 
WHERE active = true;

-- Index for room capacity queries
CREATE INDEX IF NOT EXISTS idx_room_capacity 
ON rooms(hotel_id, capacity) 
WHERE active = true;

-- ============================================================================
-- HOTEL INDEXES
-- ============================================================================

-- Partial index for active hotels by city
-- Supports: hotel search by city
CREATE INDEX IF NOT EXISTS idx_hotel_city_active 
ON hotels(city, min_price) 
WHERE active = true;

-- Index for hotel star rating queries
CREATE INDEX IF NOT EXISTS idx_hotel_rating 
ON hotels(star_rating, average_rating) 
WHERE active = true;

-- ============================================================================
-- ATTENDEE INDEXES
-- ============================================================================

-- Index for attendee lookups by booking
-- Supports: JOIN FETCH eb.attendees
CREATE INDEX IF NOT EXISTS idx_attendee_booking_id 
ON attendees(booking_id);

-- ============================================================================
-- ORGANIZER INDEXES
-- ============================================================================

-- Index for organizer lookups
-- Supports: JOIN FETCH e.organizer
CREATE INDEX IF NOT EXISTS idx_organizer_user_id 
ON organizers(user_id);

-- ============================================================================
-- BOOKING (GENERAL) INDEXES
-- ============================================================================

-- Index for customer bookings
CREATE INDEX IF NOT EXISTS idx_booking_customer_id 
ON bookings(customer_id);

-- Index for provider booking ID lookups
CREATE INDEX IF NOT EXISTS idx_booking_provider_id 
ON bookings(provider_booking_id);

-- Index for booking status
CREATE INDEX IF NOT EXISTS idx_booking_status 
ON bookings(status);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- After migration, run these queries to verify indexes were created:
-- 
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename IN ('event_bookings', 'events', 'room_bookings', 'rooms', 'hotels')
-- ORDER BY tablename, indexname;
--
-- Check index usage:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE tablename IN ('event_bookings', 'events', 'room_bookings', 'rooms', 'hotels')
-- ORDER BY idx_scan DESC;
