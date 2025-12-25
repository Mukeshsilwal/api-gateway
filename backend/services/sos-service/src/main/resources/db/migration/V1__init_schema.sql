-- SOS Service Database Schema
-- Version: 1.0
-- Description: Initial schema for emergency alerts, contacts, and safety status

-- Create emergency_alerts table
CREATE TABLE IF NOT EXISTS emergency_alerts (
    alert_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    trip_id BIGINT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status VARCHAR(20) NOT NULL, -- TRIGGERED, ACKNOWLEDGED, RESOLVED, FALSE_ALARM
    description TEXT,
    battery_level INTEGER,
    signal_strength VARCHAR(20),
    triggered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by BIGINT,
    resolution_notes TEXT
);

-- Create indexes for emergency_alerts
CREATE INDEX idx_sos_user ON emergency_alerts(user_id);
CREATE INDEX idx_sos_status ON emergency_alerts(status);
CREATE INDEX idx_sos_triggered_at ON emergency_alerts(triggered_at DESC);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    contact_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50),
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for emergency_contacts
CREATE INDEX idx_contacts_user ON emergency_contacts(user_id);

-- Create safety_status table
CREATE TABLE IF NOT EXISTS safety_status (
    status_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL, -- SAFE, DANGER, UNKNOWN
    last_check_in TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    location_lat DECIMAL(10, 8),
    location_lon DECIMAL(11, 8),
    notes TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index for safety_status (one per user)
CREATE UNIQUE INDEX idx_safety_user ON safety_status(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_status_updated_at BEFORE UPDATE ON safety_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE emergency_alerts IS 'Stores SOS alerts triggered by users';
COMMENT ON TABLE emergency_contacts IS 'Stores emergency contacts for users';
COMMENT ON TABLE safety_status IS 'Stores the current safety status of users';
