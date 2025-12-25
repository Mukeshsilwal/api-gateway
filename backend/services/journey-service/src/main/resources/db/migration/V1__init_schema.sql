-- Journey Service Database Schema
-- Version: V1__init_schema.sql

-- Journeys table
CREATE TABLE journeys (
    journey_id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    optimization_score DECIMAL(5,2),
    total_distance_km DECIMAL(10,2),
    estimated_duration_hours DECIMAL(10,2),
    total_estimated_cost DECIMAL(12,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_status CHECK (status IN ('DRAFT', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX idx_journeys_trip_id ON journeys(trip_id);
CREATE INDEX idx_journeys_user_id ON journeys(user_id);
CREATE INDEX idx_journeys_status ON journeys(status);

-- Journey segments table
CREATE TABLE journey_segments (
    segment_id BIGSERIAL PRIMARY KEY,
    journey_id BIGINT NOT NULL REFERENCES journeys(journey_id) ON DELETE CASCADE,
    sequence_order INT NOT NULL,
    segment_type VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location_from VARCHAR(255),
    location_to VARCHAR(255),
    latitude_from DECIMAL(10,8),
    longitude_from DECIMAL(11,8),
    latitude_to DECIMAL(10,8),
    longitude_to DECIMAL(11,8),
    booking_reference VARCHAR(100),
    booking_type VARCHAR(50),
    booking_id BIGINT,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_segment_type CHECK (segment_type IN ('TRAVEL', 'STAY', 'ACTIVITY', 'MEAL', 'REST', 'TRANSIT')),
    CONSTRAINT chk_segment_status CHECK (status IN ('PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'SKIPPED'))
);

CREATE INDEX idx_segments_journey_id ON journey_segments(journey_id);
CREATE INDEX idx_segments_sequence ON journey_segments(journey_id, sequence_order);
CREATE INDEX idx_segments_booking ON journey_segments(booking_type, booking_id);

-- Journey suggestions table
CREATE TABLE journey_suggestions (
    suggestion_id BIGSERIAL PRIMARY KEY,
    journey_id BIGINT NOT NULL REFERENCES journeys(journey_id) ON DELETE CASCADE,
    suggestion_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_cost DECIMAL(10,2),
    priority INT DEFAULT 0,
    relevance_score DECIMAL(5,4),
    is_accepted BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    CONSTRAINT chk_suggestion_type CHECK (suggestion_type IN ('HOTEL', 'ACTIVITY', 'RESTAURANT', 'TRANSPORT', 'EVENT', 'POI', 'OPTIMIZATION'))
);

CREATE INDEX idx_suggestions_journey_id ON journey_suggestions(journey_id);
CREATE INDEX idx_suggestions_type ON journey_suggestions(suggestion_type);
CREATE INDEX idx_suggestions_accepted ON journey_suggestions(is_accepted);

-- Journey optimization history
CREATE TABLE journey_optimizations (
    optimization_id BIGSERIAL PRIMARY KEY,
    journey_id BIGINT NOT NULL REFERENCES journeys(journey_id) ON DELETE CASCADE,
    optimization_type VARCHAR(50) NOT NULL,
    before_score DECIMAL(5,2),
    after_score DECIMAL(5,2),
    changes_applied JSONB,
    execution_time_ms INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_optimization_type CHECK (optimization_type IN ('ROUTE', 'TIME', 'COST', 'COMPREHENSIVE'))
);

CREATE INDEX idx_optimizations_journey_id ON journey_optimizations(journey_id);

-- Journey waypoints (for route optimization)
CREATE TABLE journey_waypoints (
    waypoint_id BIGSERIAL PRIMARY KEY,
    journey_id BIGINT NOT NULL REFERENCES journeys(journey_id) ON DELETE CASCADE,
    sequence_order INT NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    waypoint_type VARCHAR(50),
    arrival_time TIMESTAMP,
    departure_time TIMESTAMP,
    duration_minutes INT,
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_waypoint_type CHECK (waypoint_type IN ('START', 'END', 'STOP', 'CHECKPOINT', 'POI'))
);

CREATE INDEX idx_waypoints_journey_id ON journey_waypoints(journey_id);
CREATE INDEX idx_waypoints_sequence ON journey_waypoints(journey_id, sequence_order);

-- Journey preferences (user preferences for journey generation)
CREATE TABLE journey_preferences (
    preference_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    preference_type VARCHAR(50) NOT NULL,
    preference_value JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, preference_type)
);

CREATE INDEX idx_preferences_user_id ON journey_preferences(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_journeys_updated_at BEFORE UPDATE ON journeys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_segments_updated_at BEFORE UPDATE ON journey_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON journey_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO journey_preferences (user_id, preference_type, preference_value) VALUES
(1, 'TRAVEL_PACE', '{"pace": "MODERATE", "max_daily_travel_hours": 6}'),
(1, 'ACCOMMODATION', '{"preferred_types": ["HOTEL", "RESORT"], "min_rating": 3.5}'),
(1, 'ACTIVITIES', '{"interests": ["CULTURAL", "ADVENTURE", "FOOD"], "intensity": "MEDIUM"}'),
(1, 'BUDGET', '{"daily_budget": 5000, "accommodation_percentage": 40, "food_percentage": 30, "activities_percentage": 30}');
