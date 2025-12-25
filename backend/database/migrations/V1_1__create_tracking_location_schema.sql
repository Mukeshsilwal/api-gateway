-- =====================================================
-- Tracking & Location Schema
-- Version: 1.0
-- Description: Real-time location tracking for buses, tourists, and guides
-- =====================================================

-- Real-time location tracking
CREATE TABLE IF NOT EXISTS location_tracking (
    tracking_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    trip_id BIGINT,
    entity_type ENUM('BUS', 'TOURIST', 'GUIDE', 'VEHICLE') NOT NULL,
    entity_id BIGINT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    altitude DECIMAL(8,2),
    accuracy DECIMAL(6,2),
    speed DECIMAL(6,2),
    heading DECIMAL(5,2),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_offline BOOLEAN DEFAULT FALSE,
    battery_level INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE SET NULL,
    INDEX idx_trip_id (trip_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Emergency checkpoints for trekking
CREATE TABLE IF NOT EXISTS emergency_checkpoints (
    checkpoint_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    altitude DECIMAL(8,2),
    checkpoint_type ENUM('POLICE', 'HOSPITAL', 'RESCUE', 'CHECKPOINT', 'SHELTER') NOT NULL,
    contact_number VARCHAR(20),
    contact_person VARCHAR(255),
    region VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    description TEXT,
    facilities TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_region (region),
    INDEX idx_checkpoint_type (checkpoint_type),
    INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Points of Interest (POI)
CREATE TABLE IF NOT EXISTS points_of_interest (
    poi_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category ENUM('ATM', 'HOSPITAL', 'POLICE', 'FUEL', 'RESTAURANT', 'CULTURAL', 'EMERGENCY', 'HOTEL', 'TRANSPORT', 'SHOPPING') NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    address TEXT,
    contact_number VARCHAR(20),
    region VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    description TEXT,
    opening_hours VARCHAR(255),
    tourist_type ENUM('ALL', 'NEPALI', 'INTERNATIONAL') DEFAULT 'ALL',
    rating DECIMAL(3,2),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_region (region),
    INDEX idx_location (latitude, longitude),
    INDEX idx_tourist_type (tourist_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Route tracking (for buses and vehicles)
CREATE TABLE IF NOT EXISTS route_tracking (
    route_tracking_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    route_id BIGINT,
    vehicle_id BIGINT NOT NULL,
    vehicle_type ENUM('BUS', 'CAR', 'VAN', 'JEEP') NOT NULL,
    driver_name VARCHAR(255),
    driver_contact VARCHAR(20),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    current_latitude DECIMAL(10,8),
    current_longitude DECIMAL(11,8),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_route_id (route_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Geofence zones (for checkpoint notifications)
CREATE TABLE IF NOT EXISTS geofence_zones (
    geofence_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    center_latitude DECIMAL(10,8) NOT NULL,
    center_longitude DECIMAL(11,8) NOT NULL,
    radius_meters INT NOT NULL,
    zone_type ENUM('CHECKPOINT', 'DANGER', 'RESTRICTED', 'TOURIST_SPOT', 'EMERGENCY') NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_zone_type (zone_type),
    INDEX idx_location (center_latitude, center_longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
