-- =====================================================
-- Existing Service Enhancements
-- Version: 1.0
-- Description: Add trip tracking support to existing booking services
-- =====================================================

-- Enhance bookings table (if exists in booking-service)
-- Note: This assumes a generic bookings table exists
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS trip_id BIGINT,
ADD COLUMN IF NOT EXISTS is_part_of_trip BOOLEAN DEFAULT FALSE,
ADD INDEX IF NOT EXISTS idx_trip_id (trip_id);

-- Enhance hotel_bookings table
ALTER TABLE hotel_bookings
ADD COLUMN IF NOT EXISTS trip_id BIGINT,
ADD COLUMN IF NOT EXISTS checkin_status ENUM('PENDING', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW') DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS checkin_time TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS checkout_time TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS checkin_reminder_sent BOOLEAN DEFAULT FALSE,
ADD INDEX IF NOT EXISTS idx_trip_id (trip_id),
ADD INDEX IF NOT EXISTS idx_checkin_status (checkin_status);

-- Enhance hotels table with location data
ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS region VARCHAR(100),
ADD COLUMN IF NOT EXISTS district VARCHAR(100),
ADD INDEX IF NOT EXISTS idx_location (latitude, longitude),
ADD INDEX IF NOT EXISTS idx_region (region);

-- Enhance bus routes with tracking support
ALTER TABLE routes
ADD COLUMN IF NOT EXISTS estimated_duration_minutes INT,
ADD COLUMN IF NOT EXISTS distance_km DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS route_status ENUM('ACTIVE', 'SUSPENDED', 'SEASONAL', 'CLOSED') DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS tracking_enabled BOOLEAN DEFAULT FALSE,
ADD INDEX IF NOT EXISTS idx_route_status (route_status);

-- Bus schedule tracking
CREATE TABLE IF NOT EXISTS bus_schedule_tracking (
    schedule_tracking_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    schedule_id BIGINT NOT NULL,
    bus_id BIGINT NOT NULL,
    route_id BIGINT NOT NULL,
    scheduled_departure TIMESTAMP NOT NULL,
    actual_departure TIMESTAMP,
    scheduled_arrival TIMESTAMP NOT NULL,
    estimated_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,
    status ENUM('SCHEDULED', 'DEPARTED', 'IN_TRANSIT', 'DELAYED', 'ARRIVED', 'CANCELLED') DEFAULT 'SCHEDULED',
    delay_minutes INT DEFAULT 0,
    delay_reason VARCHAR(255),
    current_location_lat DECIMAL(10,8),
    current_location_lng DECIMAL(11,8),
    last_location_update TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_bus_id (bus_id),
    INDEX idx_route_id (route_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_departure (scheduled_departure)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event bookings enhancement
ALTER TABLE event_bookings
ADD COLUMN IF NOT EXISTS trip_id BIGINT,
ADD INDEX IF NOT EXISTS idx_trip_id (trip_id);

-- Events enhancement with location
ALTER TABLE events
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS region VARCHAR(100),
ADD INDEX IF NOT EXISTS idx_location (latitude, longitude);
