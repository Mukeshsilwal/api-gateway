-- ============================================================
-- Trip Service - Initial Schema
-- ============================================================
-- Migration: V1__init_schema.sql
-- ============================================================

DROP TABLE IF EXISTS trip_participants CASCADE;
DROP TABLE IF EXISTS trip_bookings CASCADE;
DROP TABLE IF EXISTS trip_checkpoints CASCADE;
DROP TABLE IF EXISTS trips CASCADE;

CREATE TABLE IF NOT EXISTS trips (
    trip_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    trip_name VARCHAR(255) NOT NULL,
    trip_type VARCHAR(50) NOT NULL DEFAULT 'DOMESTIC',
    tourist_type VARCHAR(50) NOT NULL DEFAULT 'NEPALI',
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(10,2),
    actual_cost DECIMAL(10,2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trip_checkpoints (
    checkpoint_id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    checkpoint_type VARCHAR(50) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    actual_time TIMESTAMP NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trip_bookings (
    id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    booking_type VARCHAR(50) NOT NULL,
    booking_id BIGINT NOT NULL,
    booking_reference VARCHAR(100),
    booking_date TIMESTAMP NOT NULL,
    amount DECIMAL(10,2),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_booking UNIQUE (booking_type, booking_id)
);

CREATE TABLE IF NOT EXISTS trip_participants (
    participant_id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    user_id BIGINT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'PARTICIPANT',
    status VARCHAR(50) NOT NULL DEFAULT 'INVITED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
