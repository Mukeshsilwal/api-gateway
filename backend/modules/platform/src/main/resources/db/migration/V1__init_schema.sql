-- Alert Service Database Schema
-- Version: 1.0
-- Description: Initial schema for alert management and notifications

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    alert_id BIGSERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Target
    user_id BIGINT,
    trip_id BIGINT,
    journey_id BIGINT,
    
    -- Source
    source_service VARCHAR(50),
    source_event_id VARCHAR(100),
    
    -- Metadata
    metadata JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    -- Delivery
    delivery_channels TEXT[],
    delivered_at TIMESTAMP,
    
    -- Scheduling
    scheduled_for TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for alerts
CREATE INDEX idx_alerts_user ON alerts(user_id, created_at DESC);
CREATE INDEX idx_alerts_trip ON alerts(trip_id);
CREATE INDEX idx_alerts_journey ON alerts(journey_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_scheduled ON alerts(scheduled_for) WHERE status = 'PENDING';
CREATE INDEX idx_alerts_unread ON alerts(user_id, is_read) WHERE is_read = FALSE;

-- Create alert_rules table
CREATE TABLE IF NOT EXISTS alert_rules (
    rule_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    alert_type VARCHAR(50) NOT NULL,
    
    -- Conditions
    conditions JSONB NOT NULL,
    
    -- Actions
    severity VARCHAR(20) NOT NULL,
    channels TEXT[],
    template_id VARCHAR(100),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for alert_rules
CREATE INDEX idx_rules_type ON alert_rules(alert_type);
CREATE INDEX idx_rules_active ON alert_rules(is_active);
CREATE INDEX idx_rules_priority ON alert_rules(priority DESC);

-- Create alert_preferences table
CREATE TABLE IF NOT EXISTS alert_preferences (
    preference_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    
    -- Channel preferences
    enable_push BOOLEAN DEFAULT TRUE,
    enable_email BOOLEAN DEFAULT TRUE,
    enable_sms BOOLEAN DEFAULT FALSE,
    enable_websocket BOOLEAN DEFAULT TRUE,
    
    -- Alert type preferences
    alert_types JSONB,
    
    -- Quiet hours
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for alert_preferences
CREATE INDEX idx_preferences_user ON alert_preferences(user_id);

-- Create alert_delivery_log table
CREATE TABLE IF NOT EXISTS alert_delivery_log (
    log_id BIGSERIAL PRIMARY KEY,
    alert_id BIGINT NOT NULL REFERENCES alerts(alert_id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    delivered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for alert_delivery_log
CREATE INDEX idx_delivery_alert ON alert_delivery_log(alert_id);
CREATE INDEX idx_delivery_status ON alert_delivery_log(status);
CREATE INDEX idx_delivery_channel ON alert_delivery_log(channel);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON alert_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON alert_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default alert rules
INSERT INTO alert_rules (name, description, alert_type, conditions, severity, channels, is_active, priority) VALUES
('Traffic Delay Alert', 'Alert when traffic delay exceeds 30 minutes', 'TRAFFIC_DELAY', '{"delay_minutes": 30}', 'MEDIUM', ARRAY['WEBSOCKET', 'PUSH'], true, 5),
('Severe Weather Alert', 'Alert for severe weather conditions', 'SEVERE_WEATHER', '{"severity": "high"}', 'HIGH', ARRAY['WEBSOCKET', 'PUSH', 'EMAIL'], true, 10),
('Checkpoint Approaching', 'Alert 15 minutes before checkpoint', 'CHECKPOINT_APPROACHING', '{"minutes_before": 15}', 'INFO', ARRAY['WEBSOCKET', 'PUSH'], true, 3),
('Geofence Violation', 'Alert when entity leaves designated area', 'GEOFENCE_VIOLATION', '{}', 'HIGH', ARRAY['WEBSOCKET', 'PUSH'], true, 8),
('Emergency SOS', 'Critical emergency alert', 'EMERGENCY_SOS', '{}', 'CRITICAL', ARRAY['WEBSOCKET', 'PUSH', 'SMS', 'EMAIL'], true, 15);

-- Add comments to tables
COMMENT ON TABLE alerts IS 'Stores all alerts and notifications for users';
COMMENT ON TABLE alert_rules IS 'Defines rules for automatic alert generation';
COMMENT ON TABLE alert_preferences IS 'User preferences for alert delivery';
COMMENT ON TABLE alert_delivery_log IS 'Logs all alert delivery attempts';

-- Add comments to important columns
COMMENT ON COLUMN alerts.alert_type IS 'Type of alert: TRAFFIC_DELAY, WEATHER_ALERT, SAFETY_ALERT, etc.';
COMMENT ON COLUMN alerts.severity IS 'Alert severity: INFO, LOW, MEDIUM, HIGH, CRITICAL';
COMMENT ON COLUMN alerts.status IS 'Alert status: PENDING, SENT, DELIVERED, FAILED';
COMMENT ON COLUMN alerts.delivery_channels IS 'Channels used for delivery: WEBSOCKET, PUSH, EMAIL, SMS';
