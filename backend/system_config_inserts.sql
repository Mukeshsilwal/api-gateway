-- =============================================
-- System Configuration Insert Script
-- =============================================

-- 0. Drop Tables if exists (Optional, be careful)
-- DROP TABLE IF EXISTS system_config;
-- DROP TABLE IF EXISTS system_config_master;

-- 1. Create Tables

CREATE TABLE IF NOT EXISTS system_config_master (
    id BIGSERIAL PRIMARY KEY,
    config_code VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_config (
    id BIGSERIAL PRIMARY KEY,
    master_id BIGINT NOT NULL,
    config_key VARCHAR(255) NOT NULL UNIQUE,
    config_value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_system_config_master FOREIGN KEY (master_id) REFERENCES system_config_master(id)
);

-- 2. Insert System Config Masters (Categories)
INSERT INTO system_config_master (config_code, description, is_active, created_at, updated_at) VALUES 
('AUTH_CONFIG', 'Authentication and Security Settings', true, NOW(), NOW()),
('EVENT_CONFIG', 'Event Service Settings', true, NOW(), NOW()),
('SHARED_CONFIG', 'Shared Configurations across services', true, NOW(), NOW()),('PAYMENT_CONFIG', 'Payment Service Settings', true, NOW(), NOW());


-- 2. Insert System Configs (Key-Value Pairs)

-- AUTH_CONFIG
INSERT INTO system_config (master_id, config_key, config_value, description, is_active, created_at, updated_at) VALUES 
((SELECT id FROM system_config_master WHERE config_code = 'AUTH_CONFIG'), 'JWT_SECRET', 'dMbz7o4YE45aAyT6BUYMsO_ireJ00J96Xxbv6AQ65xb0Ajauql1fScOEP4hEb7oyBtjHfTjvkeXBfpSjE8uyoA', 'JWT Signing Secret', true, NOW(), NOW()),
((SELECT id FROM system_config_master WHERE config_code = 'AUTH_CONFIG'), 'JWT_EXPIRATION_MS', '3600000', 'JWT Expiration in milliseconds', true, NOW(), NOW()),
((SELECT id FROM system_config_master WHERE config_code = 'AUTH_CONFIG'), 'JWT_REFRESH_EXPIRATION_MS', '600000', 'JWT Refresh Token Expiration in milliseconds', true, NOW(), NOW()),
((SELECT id FROM system_config_master WHERE config_code = 'AUTH_CONFIG'), 'GOOGLE_CLIENT_ID', '130041322678-e82m79prh88nhesanq9p3m2s48a85psk.apps.googleusercontent.com', 'Google OAuth Client ID', true, NOW(), NOW()),
((SELECT id FROM system_config_master WHERE config_code = 'AUTH_CONFIG'), 'GOOGLE_CLIENT_SECRET', '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', 'Google OAuth Client Secret', true, NOW(), NOW());

-- PAYMENT_CONFIG
INSERT INTO system_config (master_id, config_key, config_value, description, is_active, created_at, updated_at) VALUES 
((SELECT id FROM system_config_master WHERE config_code = 'PAYMENT_CONFIG'), 'ESEWA_MERCHANT_CODE', 'EPAYTEST', 'Esewa Merchant Code', true, NOW(), NOW()),
((SELECT id FROM system_config_master WHERE config_code = 'PAYMENT_CONFIG'), 'ESEWA_SECRET_KEY', '8gBm/:&EnhH.1/q', 'Esewa Secret Key', true, NOW(), NOW()),
((SELECT id FROM system_config_master WHERE config_code = 'PAYMENT_CONFIG'), 'ESEWA_BASE_URL', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form', 'Esewa Base Payment URL', true, NOW(), NOW()),
((SELECT id FROM system_config_master WHERE config_code = 'PAYMENT_CONFIG'), 'ESEWA_VERIFY_URL', 'https://rc-epay.esewa.com.np/api/epay/transaction/status', 'Esewa Verification URL', true, NOW(), NOW());

-- EVENT_CONFIG
INSERT INTO system_config (master_id, config_key, config_value, description, is_active, created_at, updated_at) VALUES 
((SELECT id FROM system_config_master WHERE config_code = 'EVENT_CONFIG'), 'QR_WIDTH', '300', 'QR Code Width', true, NOW(), NOW()),
((SELECT id FROM system_config_master WHERE config_code = 'EVENT_CONFIG'), 'QR_HEIGHT', '300', 'QR Code Height', true, NOW(), NOW()),
((SELECT id FROM system_config_master WHERE config_code = 'EVENT_CONFIG'), 'UPLOAD_MAX_FILE_SIZE', '10MB', 'Max Upload File Size', true, NOW(), NOW()),
((SELECT id FROM system_config_master WHERE config_code = 'EVENT_CONFIG'), 'PAGINATION_DEFAULT_SIZE', '20', 'Default Pagination Size', true, NOW(), NOW());

-- BOOKING_CONFIG (Reusing EVENT_CONFIG or creating new? Let's use SHARED or create BOOKING)
-- Using SHARED for now or creating a new category if strictly needed. 
-- The user script had 4 categories. I'll stick to 4 or add BOOKING. 
-- Let's add BOOKING_CONFIG category.
INSERT INTO system_config_master (config_code, description, is_active, created_at, updated_at) VALUES 
('BOOKING_CONFIG', 'Booking Service Settings', true, NOW(), NOW());

INSERT INTO system_config (master_id, config_key, config_value, description, is_active, created_at, updated_at) VALUES 
((SELECT id FROM system_config_master WHERE config_code = 'BOOKING_CONFIG'), 'INVENTORY_LOCK_TTL', '300', 'Inventory Lock TTL in seconds', true, NOW(), NOW());

-- SHARED_CONFIG
INSERT INTO system_config (master_id, config_key, config_value, description, is_active, created_at, updated_at) VALUES 
((SELECT id FROM system_config_master WHERE config_code = 'SHARED_CONFIG'), 'SENDGRID_API_KEY', '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', 'SendGrid API Key', true, NOW(), NOW()),
((SELECT id FROM system_config_master WHERE config_code = 'SHARED_CONFIG'), 'EMAIL_FROM_ADDRESS', 'ticketkatum5@gmail.com', 'Email From Address', true, NOW(), NOW()),
((SELECT id FROM system_config_master WHERE config_code = 'SHARED_CONFIG'), 'SUPPORT_EMAIL', 'support@ticketkatum.com', 'Support Email Address', true, NOW(), NOW());
