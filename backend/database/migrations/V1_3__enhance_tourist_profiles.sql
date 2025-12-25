-- =====================================================
-- Tourist Profile Enhancement
-- Version: 1.0
-- Description: Enhance user profiles for tourist-specific features
-- =====================================================

-- Enhance existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS tourist_type ENUM('NEPALI', 'INTERNATIONAL') DEFAULT 'NEPALI',
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS travel_interests TEXT COMMENT 'JSON array of interests',
ADD COLUMN IF NOT EXISTS passport_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD INDEX IF NOT EXISTS idx_tourist_type (tourist_type),
ADD INDEX IF NOT EXISTS idx_nationality (nationality);

-- Tourist preferences
CREATE TABLE IF NOT EXISTS tourist_preferences (
    preference_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    budget_range VARCHAR(50),
    preferred_activities TEXT COMMENT 'JSON array: ["Adventure", "Religious", "Nature", "Luxury"]',
    accommodation_preference ENUM('BUDGET', 'STANDARD', 'LUXURY', 'ANY') DEFAULT 'ANY',
    travel_style ENUM('SOLO', 'COUPLE', 'FAMILY', 'GROUP') DEFAULT 'SOLO',
    dietary_restrictions TEXT,
    accessibility_needs TEXT,
    preferred_transport ENUM('BUS', 'PRIVATE', 'FLIGHT', 'ANY') DEFAULT 'ANY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preference (user_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User travel history (for recommendations)
CREATE TABLE IF NOT EXISTS user_travel_history (
    history_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    trip_id BIGINT,
    destination VARCHAR(255) NOT NULL,
    trip_type ENUM('DOMESTIC', 'INTERNATIONAL') NOT NULL,
    visit_date DATE NOT NULL,
    duration_days INT,
    rating INT,
    review TEXT,
    would_recommend BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_destination (destination)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Saved destinations (wishlist)
CREATE TABLE IF NOT EXISTS saved_destinations (
    saved_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    destination_name VARCHAR(255) NOT NULL,
    destination_type ENUM('CITY', 'TREK', 'RELIGIOUS', 'ADVENTURE', 'CULTURAL') NOT NULL,
    notes TEXT,
    priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_destination_type (destination_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
