-- =====================================================
-- Alert & Notification Schema
-- Version: 1.0
-- Description: Alert system for weather, road conditions, delays, and emergencies
-- =====================================================

-- Alert system
CREATE TABLE IF NOT EXISTS alerts (
    alert_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    alert_type ENUM('WEATHER', 'ROAD_BLOCK', 'DELAY', 'STRIKE', 'EMERGENCY', 'SAFETY', 'MAINTENANCE', 'EVENT') NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    affected_region VARCHAR(255),
    affected_routes TEXT,
    affected_districts TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    radius_km DECIMAL(6,2),
    valid_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    source VARCHAR(100),
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_alert_type (alert_type),
    INDEX idx_severity (severity),
    INDEX idx_region (affected_region),
    INDEX idx_active (is_active),
    INDEX idx_valid_period (valid_from, valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User-specific notifications
CREATE TABLE IF NOT EXISTS trip_notifications (
    notification_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    trip_id BIGINT,
    user_id BIGINT NOT NULL,
    alert_id BIGINT,
    notification_type ENUM('ALERT', 'REMINDER', 'UPDATE', 'EMERGENCY', 'BOOKING', 'PAYMENT', 'CHECKIN') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') DEFAULT 'NORMAL',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    sent_via ENUM('IN_APP', 'EMAIL', 'SMS', 'PUSH') DEFAULT 'IN_APP',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (alert_id) REFERENCES alerts(alert_id) ON DELETE SET NULL,
    INDEX idx_trip_id (trip_id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alert subscriptions (users can subscribe to specific regions/routes)
CREATE TABLE IF NOT EXISTS alert_subscriptions (
    subscription_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    subscription_type ENUM('REGION', 'ROUTE', 'DISTRICT', 'ALL') NOT NULL,
    subscription_value VARCHAR(255),
    alert_types TEXT,
    min_severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_subscription_type (subscription_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alternative suggestions (when alerts affect trips)
CREATE TABLE IF NOT EXISTS alert_alternatives (
    alternative_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    alert_id BIGINT NOT NULL,
    alternative_type ENUM('ROUTE', 'TRANSPORT', 'ACCOMMODATION', 'SCHEDULE') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_cost DECIMAL(10,2),
    estimated_time_minutes INT,
    priority INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_id) REFERENCES alerts(alert_id) ON DELETE CASCADE,
    INDEX idx_alert_id (alert_id),
    INDEX idx_alternative_type (alternative_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Emergency SOS records
CREATE TABLE IF NOT EXISTS emergency_sos (
    sos_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    trip_id BIGINT,
    user_id BIGINT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    altitude DECIMAL(8,2),
    accuracy DECIMAL(6,2),
    emergency_type ENUM('MEDICAL', 'ACCIDENT', 'LOST', 'THREAT', 'NATURAL_DISASTER', 'OTHER') NOT NULL,
    description TEXT,
    status ENUM('ACTIVE', 'ACKNOWLEDGED', 'RESPONDING', 'RESOLVED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    triggered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    responder_id BIGINT,
    responder_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_trip_id (trip_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_triggered_at (triggered_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Emergency contacts notified
CREATE TABLE IF NOT EXISTS emergency_contacts_notified (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sos_id BIGINT NOT NULL,
    contact_type ENUM('EMERGENCY_CONTACT', 'GUIDE', 'HOTEL', 'SUPPORT_TEAM', 'AUTHORITY') NOT NULL,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notification_status ENUM('SENT', 'DELIVERED', 'FAILED') DEFAULT 'SENT',
    FOREIGN KEY (sos_id) REFERENCES emergency_sos(sos_id) ON DELETE CASCADE,
    INDEX idx_sos_id (sos_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
