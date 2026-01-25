-- ============================================================
-- Travel Module - Consolidated Initial Schema
-- ============================================================
-- Migration: V1__init_schema.sql
-- ============================================================

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS guide_availability CASCADE;
DROP TABLE IF EXISTS service_packages CASCADE;
DROP TABLE IF EXISTS guide_languages CASCADE;
DROP TABLE IF EXISTS guide_specialties CASCADE;
DROP TABLE IF EXISTS guides CASCADE;
DROP TABLE IF EXISTS attendees CASCADE;
DROP TABLE IF EXISTS room_bookings CASCADE;
DROP TABLE IF EXISTS event_bookings CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS seats CASCADE;
DROP TABLE IF EXISTS bus CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS organizers CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;

-- 1. BASE ENTITIES (HOTEL, EVENT, BUS)

CREATE TABLE IF NOT EXISTS hotels (
    hotel_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    min_price DECIMAL(10,2),
    star_rating INTEGER,
    average_rating DECIMAL(3,2),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
    room_id BIGSERIAL PRIMARY KEY,
    hotel_id BIGINT REFERENCES hotels(hotel_id),
    room_type VARCHAR(100),
    base_price DECIMAL(10,2),
    capacity INTEGER,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organizers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS venues (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    organizer_id BIGINT REFERENCES organizers(id),
    venue_id BIGINT REFERENCES venues(id),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    event_date TIMESTAMP,
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routes (
    id BIGSERIAL PRIMARY KEY,
    source VARCHAR(255),
    destination VARCHAR(255),
    distance_km DECIMAL(10,2),
    estimated_duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bus (
    id BIGSERIAL PRIMARY KEY,
    bus_name VARCHAR(255),
    bus_type VARCHAR(50),
    departure_date_time TIMESTAMP,
    base_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    route_id BIGINT REFERENCES routes(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seats (
    id BIGSERIAL PRIMARY KEY,
    bus_id BIGINT REFERENCES bus(id),
    seat_number VARCHAR(20),
    is_booked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. BOOKING ENTITIES

CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT,
    provider_booking_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES bookings(id),
    seat_id BIGINT REFERENCES seats(id),
    passenger_name VARCHAR(255),
    ticket_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    event_id BIGINT REFERENCES events(id),
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_bookings (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT REFERENCES rooms(room_id),
    customer_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    check_in DATE,
    check_out DATE,
    booking_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendees (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES event_bookings(id),
    name VARCHAR(255),
    email VARCHAR(255)
);

-- 3. GUIDE SERVICE TABLES

CREATE TABLE IF NOT EXISTS guides (
    guide_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50),
    years_experience INTEGER,
    bio TEXT,
    profile_image_url VARCHAR(255),
    verification_status VARCHAR(20) DEFAULT 'PENDING',
    rating DECIMAL(3, 2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guide_specialties (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES guides(guide_id) ON DELETE CASCADE,
    specialty VARCHAR(50) NOT NULL,
    UNIQUE(guide_id, specialty)
);

CREATE TABLE IF NOT EXISTS guide_languages (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES guides(guide_id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    proficiency VARCHAR(20) DEFAULT 'FLUENT',
    UNIQUE(guide_id, language)
);

CREATE TABLE IF NOT EXISTS service_packages (
    package_id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES guides(guide_id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    duration_hours INTEGER,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NPR',
    max_group_size INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guide_availability (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES guides(guide_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    booking_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(guide_id, date)
);

CREATE TABLE IF NOT EXISTS reviews (
    review_id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES guides(guide_id) ON DELETE CASCADE,
    reviewer_id BIGINT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. UTILITY FUNCTIONS

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_guides_updated_at ON guides;
CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_packages_updated_at ON service_packages;
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON service_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
