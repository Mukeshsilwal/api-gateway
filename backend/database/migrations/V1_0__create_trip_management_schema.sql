-- =====================================================
-- Trip Management Schema
-- Version: 1.0
-- Description: Core trip entities for Smart Tourism Platform
-- =====================================================

-- Core trip entity
CREATE TABLE IF NOT EXISTS trips (
    trip_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    trip_name VARCHAR(255) NOT NULL,
    trip_type ENUM('DOMESTIC', 'INTERNATIONAL') NOT NULL DEFAULT 'DOMESTIC',
    tourist_type ENUM('NEPALI', 'INTERNATIONAL') NOT NULL DEFAULT 'NEPALI',
    status ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(10,2),
    actual_cost DECIMAL(10,2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trip timeline/checkpoints
CREATE TABLE IF NOT EXISTS trip_checkpoints (
    checkpoint_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    trip_id BIGINT NOT NULL,
    checkpoint_type ENUM('DEPARTURE', 'TRANSIT', 'ARRIVAL', 'HOTEL_CHECKIN', 'HOTEL_CHECKOUT', 'ACTIVITY', 'RETURN') NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    actual_time TIMESTAMP NULL,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    INDEX idx_trip_id (trip_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_time (scheduled_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trip bookings association
CREATE TABLE IF NOT EXISTS trip_bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    trip_id BIGINT NOT NULL,
    booking_type ENUM('BUS', 'HOTEL', 'EVENT', 'GUIDE', 'MARKET') NOT NULL,
    booking_id BIGINT NOT NULL,
    booking_reference VARCHAR(100),
    booking_date TIMESTAMP NOT NULL,
    amount DECIMAL(10,2),
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    INDEX idx_trip_id (trip_id),
    INDEX idx_booking_type_id (booking_type, booking_id),
    UNIQUE KEY unique_booking (booking_type, booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trip participants (for group trips)
CREATE TABLE IF NOT EXISTS trip_participants (
    participant_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    trip_id BIGINT NOT NULL,
    user_id BIGINT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    role ENUM('ORGANIZER', 'PARTICIPANT', 'GUIDE') NOT NULL DEFAULT 'PARTICIPANT',
    status ENUM('INVITED', 'CONFIRMED', 'DECLINED') NOT NULL DEFAULT 'INVITED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_trip_id (trip_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
