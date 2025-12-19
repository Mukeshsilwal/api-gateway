-- ============================================================
-- Hotel Service - Performance Indexes
-- ============================================================
-- Migration: V2__add_performance_indexes.sql
-- Description: Add indexes for common query patterns
-- ============================================================

-- ============================================================
-- Hotels Table Indexes
-- ============================================================

-- City search (most common query)
CREATE INDEX IF NOT EXISTS idx_hotel_city 
ON hotels(city);

-- Rating filter
CREATE INDEX IF NOT EXISTS idx_hotel_rating 
ON hotels(rating DESC);

-- Price range filter
CREATE INDEX IF NOT EXISTS idx_hotel_price 
ON hotels(price_per_night);

-- Composite index for city + rating + price (covers most searches)
CREATE INDEX IF NOT EXISTS idx_hotel_search 
ON hotels(city, rating DESC, price_per_night);

-- Featured hotels
CREATE INDEX IF NOT EXISTS idx_hotel_featured 
ON hotels(is_featured) 
WHERE is_featured = true;

-- Active hotels only
CREATE INDEX IF NOT EXISTS idx_hotel_active 
ON hotels(is_active, city) 
WHERE is_active = true;

-- Full-text search on name and description
CREATE INDEX IF NOT EXISTS idx_hotel_name_search 
ON hotels USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================================
-- Rooms Table Indexes
-- ============================================================

-- Room availability by hotel
CREATE INDEX IF NOT EXISTS idx_room_hotel_available 
ON rooms(hotel_id, is_available) 
WHERE is_available = true;

-- Room type filter
CREATE INDEX IF NOT EXISTS idx_room_type 
ON rooms(room_type, hotel_id);

-- Maintenance status (for operational queries)
CREATE INDEX IF NOT EXISTS idx_room_maintenance 
ON rooms(maintenance_status) 
WHERE maintenance_status != 'OPERATIONAL';

-- Price range for rooms
CREATE INDEX IF NOT EXISTS idx_room_price 
ON rooms(price_per_night, hotel_id);

-- Composite index for room search
CREATE INDEX IF NOT EXISTS idx_room_search 
ON rooms(hotel_id, is_available, room_type, price_per_night);

-- ============================================================
-- Bookings Table Indexes
-- ============================================================

-- User's bookings (most common query)
CREATE INDEX IF NOT EXISTS idx_booking_user 
ON bookings(user_id, booking_date DESC);

-- Hotel bookings
CREATE INDEX IF NOT EXISTS idx_booking_hotel 
ON bookings(hotel_id, check_in_date, check_out_date);

-- Date range queries
CREATE INDEX IF NOT EXISTS idx_booking_dates 
ON bookings(check_in_date, check_out_date);

-- Active bookings (status filter)
CREATE INDEX IF NOT EXISTS idx_booking_status 
ON bookings(status, booking_date DESC) 
WHERE status NOT IN ('COMPLETED', 'CANCELLED');

-- Composite index for availability check
CREATE INDEX IF NOT EXISTS idx_booking_availability 
ON bookings(hotel_id, room_id, check_in_date, check_out_date, status) 
WHERE status IN ('CONFIRMED', 'CHECKED_IN');

-- Payment status
CREATE INDEX IF NOT EXISTS idx_booking_payment 
ON bookings(payment_status) 
WHERE payment_status = 'PENDING';

-- ============================================================
-- Reviews Table Indexes
-- ============================================================

-- Hotel reviews
CREATE INDEX IF NOT EXISTS idx_review_hotel 
ON reviews(hotel_id, created_at DESC);

-- User reviews
CREATE INDEX IF NOT EXISTS idx_review_user 
ON reviews(user_id, created_at DESC);

-- Rating filter
CREATE INDEX IF NOT EXISTS idx_review_rating 
ON reviews(rating DESC, hotel_id);

-- Verified reviews
CREATE INDEX IF NOT EXISTS idx_review_verified 
ON reviews(is_verified, hotel_id) 
WHERE is_verified = true;

-- ============================================================
-- Amenities Table Indexes
-- ============================================================

-- Hotel amenities lookup
CREATE INDEX IF NOT EXISTS idx_amenity_hotel 
ON hotel_amenities(hotel_id);

-- Amenity type filter
CREATE INDEX IF NOT EXISTS idx_amenity_type 
ON hotel_amenities(amenity_type, hotel_id);

-- ============================================================
-- Photos Table Indexes
-- ============================================================

-- Hotel photos
CREATE INDEX IF NOT EXISTS idx_photo_hotel 
ON hotel_photos(hotel_id, display_order);

-- Primary photos
CREATE INDEX IF NOT EXISTS idx_photo_primary 
ON hotel_photos(hotel_id) 
WHERE is_primary = true;

-- ============================================================
-- Statistics and Analysis
-- ============================================================

-- Update table statistics for query planner
ANALYZE hotels;
ANALYZE rooms;
ANALYZE bookings;
ANALYZE reviews;
ANALYZE hotel_amenities;
ANALYZE hotel_photos;

-- ============================================================
-- Index Usage Monitoring Query
-- ============================================================
-- Run this to check index usage:
-- 
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     idx_scan,
--     idx_tup_read,
--     idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;
