-- Timeline Service Database Schema
-- Version: V1__init_schema.sql

-- Timelines table
CREATE TABLE timelines (
    timeline_id BIGSERIAL PRIMARY KEY,
    journey_id BIGINT NOT NULL UNIQUE,
    trip_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    current_checkpoint_id BIGINT,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_on_schedule BOOLEAN DEFAULT TRUE,
    delay_minutes INT DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_progress CHECK (progress_percentage BETWEEN 0 AND 100),
    CONSTRAINT chk_status CHECK (status IN ('PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX idx_timelines_journey_id ON timelines(journey_id);
CREATE INDEX idx_timelines_user_id ON timelines(user_id);
CREATE INDEX idx_timelines_status ON timelines(status);

-- Checkpoints table
CREATE TABLE checkpoints (
    checkpoint_id BIGSERIAL PRIMARY KEY,
    timeline_id BIGINT NOT NULL REFERENCES timelines(timeline_id) ON DELETE CASCADE,
    checkpoint_type VARCHAR(50) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    scheduled_time TIMESTAMP NOT NULL,
    actual_time TIMESTAMP,
    estimated_arrival_time TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    sequence_order INT NOT NULL,
    duration_minutes INT,
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_checkpoint_type CHECK (checkpoint_type IN ('DEPARTURE', 'ARRIVAL', 'ACTIVITY', 'MEAL', 'REST', 'TRANSIT', 'CUSTOM')),
    CONSTRAINT chk_checkpoint_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'DELAYED', 'CANCELLED'))
);

CREATE INDEX idx_checkpoints_timeline_id ON checkpoints(timeline_id);
CREATE INDEX idx_checkpoints_sequence ON checkpoints(timeline_id, sequence_order);
CREATE INDEX idx_checkpoints_status ON checkpoints(status);
CREATE INDEX idx_checkpoints_scheduled_time ON checkpoints(scheduled_time);

-- Timeline events table (for audit trail)
CREATE TABLE timeline_events (
    event_id BIGSERIAL PRIMARY KEY,
    timeline_id BIGINT NOT NULL REFERENCES timelines(timeline_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_event_type CHECK (event_type IN ('CREATED', 'STARTED', 'CHECKPOINT_REACHED', 'CHECKPOINT_DELAYED', 'CHECKPOINT_SKIPPED', 'PAUSED', 'RESUMED', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX idx_timeline_events_timeline_id ON timeline_events(timeline_id);
CREATE INDEX idx_timeline_events_type ON timeline_events(event_type);
CREATE INDEX idx_timeline_events_created_at ON timeline_events(created_at);

-- Delays table (track all delays)
CREATE TABLE delays (
    delay_id BIGSERIAL PRIMARY KEY,
    timeline_id BIGINT NOT NULL REFERENCES timelines(timeline_id) ON DELETE CASCADE,
    checkpoint_id BIGINT REFERENCES checkpoints(checkpoint_id) ON DELETE SET NULL,
    delay_type VARCHAR(50) NOT NULL,
    delay_minutes INT NOT NULL,
    reason TEXT,
    detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    is_resolved BOOLEAN DEFAULT FALSE,
    CONSTRAINT chk_delay_type CHECK (delay_type IN ('TRAFFIC', 'WEATHER', 'BOOKING', 'PERSONAL', 'OTHER'))
);

CREATE INDEX idx_delays_timeline_id ON delays(timeline_id);
CREATE INDEX idx_delays_checkpoint_id ON delays(checkpoint_id);
CREATE INDEX idx_delays_is_resolved ON delays(is_resolved);

-- Notifications table (timeline-related notifications)
CREATE TABLE timeline_notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    timeline_id BIGINT NOT NULL REFERENCES timelines(timeline_id) ON DELETE CASCADE,
    checkpoint_id BIGINT REFERENCES checkpoints(checkpoint_id) ON DELETE SET NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_notification_type CHECK (notification_type IN ('REMINDER', 'DELAY_ALERT', 'CHECKPOINT_APPROACHING', 'CHECKPOINT_MISSED', 'SCHEDULE_CHANGE'))
);

CREATE INDEX idx_notifications_timeline_id ON timeline_notifications(timeline_id);
CREATE INDEX idx_notifications_is_read ON timeline_notifications(is_read);
CREATE INDEX idx_notifications_scheduled_for ON timeline_notifications(scheduled_for);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_timelines_updated_at BEFORE UPDATE ON timelines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkpoints_updated_at BEFORE UPDATE ON checkpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate progress percentage
CREATE OR REPLACE FUNCTION calculate_timeline_progress(p_timeline_id BIGINT)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_checkpoints INT;
    completed_checkpoints INT;
    progress DECIMAL(5,2);
BEGIN
    SELECT COUNT(*) INTO total_checkpoints
    FROM checkpoints
    WHERE timeline_id = p_timeline_id;
    
    IF total_checkpoints = 0 THEN
        RETURN 0.00;
    END IF;
    
    SELECT COUNT(*) INTO completed_checkpoints
    FROM checkpoints
    WHERE timeline_id = p_timeline_id
    AND status = 'COMPLETED';
    
    progress := (completed_checkpoints::DECIMAL / total_checkpoints::DECIMAL) * 100;
    
    RETURN ROUND(progress, 2);
END;
$$ LANGUAGE plpgsql;

-- Sample data
INSERT INTO timelines (journey_id, trip_id, user_id, status) VALUES
(1, 1, 1, 'PENDING');
