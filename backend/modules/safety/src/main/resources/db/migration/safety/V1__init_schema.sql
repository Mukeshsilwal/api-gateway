-- Tracking Service Database Schema
-- Version: 1.0
-- Description: Initial schema for location tracking and points of interest

-- Create location_tracking table
CREATE TABLE IF NOT EXISTS location_tracking (
    tracking_id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    altitude DECIMAL(8, 2),
    accuracy DECIMAL(6, 2),
    speed DECIMAL(6, 2),
    heading DECIMAL(5, 2),
    timestamp TIMESTAMP NOT NULL,
    is_offline BOOLEAN DEFAULT FALSE,
    battery_level INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for location_tracking
CREATE INDEX IF NOT EXISTS idx_location_trip_id ON location_tracking(trip_id);
CREATE INDEX IF NOT EXISTS idx_location_entity ON location_tracking(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_location_timestamp ON location_tracking(timestamp);
CREATE INDEX IF NOT EXISTS idx_location_entity_timestamp ON location_tracking(entity_type, entity_id, timestamp DESC);

-- Create point_of_interest table
CREATE TABLE IF NOT EXISTS point_of_interest (
    poi_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    altitude DECIMAL(8, 2),
    region VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    phone VARCHAR(50),
    website VARCHAR(255),
    rating DECIMAL(3, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for point_of_interest
CREATE INDEX IF NOT EXISTS idx_poi_category ON point_of_interest(category);
CREATE INDEX IF NOT EXISTS idx_poi_region ON point_of_interest(region);
CREATE INDEX IF NOT EXISTS idx_poi_location ON point_of_interest(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_poi_active ON point_of_interest(is_active);

-- Create geofence table for future use
CREATE TABLE IF NOT EXISTS geofence (
    geofence_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    center_latitude DECIMAL(10, 8) NOT NULL,
    center_longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for geofence
CREATE INDEX IF NOT EXISTS idx_geofence_active ON geofence(is_active);
CREATE INDEX IF NOT EXISTS idx_geofence_location ON geofence(center_latitude, center_longitude);

-- Create tracking_session table
CREATE TABLE IF NOT EXISTS tracking_session (
    session_id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    total_distance_km DECIMAL(10, 2),
    average_speed_kmh DECIMAL(6, 2),
    max_speed_kmh DECIMAL(6, 2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for tracking_session
CREATE INDEX IF NOT EXISTS idx_session_trip ON tracking_session(trip_id);
CREATE INDEX IF NOT EXISTS idx_session_entity ON tracking_session(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_session_status ON tracking_session(status);
CREATE INDEX IF NOT EXISTS idx_session_start_time ON tracking_session(start_time DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_poi_updated_at BEFORE UPDATE ON point_of_interest
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geofence_updated_at BEFORE UPDATE ON geofence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_updated_at BEFORE UPDATE ON tracking_session
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample POIs for Nepal
INSERT INTO point_of_interest (name, description, category, latitude, longitude, region, city, rating, is_active) VALUES
('Pashupatinath Temple', 'Sacred Hindu temple complex on the banks of Bagmati River', 'TEMPLE', 27.7104, 85.3487, 'Bagmati', 'Kathmandu', 4.8, true),
('Boudhanath Stupa', 'One of the largest Buddhist stupas in Nepal', 'TEMPLE', 27.7215, 85.3622, 'Bagmati', 'Kathmandu', 4.7, true),
('Swayambhunath', 'Ancient religious architecture atop a hill in Kathmandu Valley', 'TEMPLE', 27.7149, 85.2906, 'Bagmati', 'Kathmandu', 4.6, true),
('Kathmandu Durbar Square', 'Historic plaza facing old royal palace', 'HISTORICAL', 27.7045, 85.3076, 'Bagmati', 'Kathmandu', 4.5, true),
('Patan Durbar Square', 'Ancient royal palace complex', 'HISTORICAL', 27.6726, 85.3257, 'Bagmati', 'Lalitpur', 4.6, true),
('Bhaktapur Durbar Square', 'Royal palace of the old Bhaktapur Kingdom', 'HISTORICAL', 27.6722, 85.4276, 'Bagmati', 'Bhaktapur', 4.7, true),
('Phewa Lake', 'Freshwater lake in Pokhara', 'NATURE', 28.2096, 83.9586, 'Gandaki', 'Pokhara', 4.8, true),
('Sarangkot', 'Hill station famous for panoramic Himalayan views', 'VIEWPOINT', 28.2468, 83.9545, 'Gandaki', 'Pokhara', 4.7, true),
('World Peace Pagoda', 'Buddhist stupa on Anadu Hill', 'TEMPLE', 28.2162, 83.9419, 'Gandaki', 'Pokhara', 4.6, true),
('Chitwan National Park', 'First national park in Nepal', 'NATURE', 27.5291, 84.3542, 'Narayani', 'Chitwan', 4.9, true);

-- Add comments to tables
COMMENT ON TABLE location_tracking IS 'Stores real-time GPS location updates for tracked entities';
COMMENT ON TABLE point_of_interest IS 'Points of interest (POIs) for tourism and navigation';
COMMENT ON TABLE geofence IS 'Geofence definitions for location-based alerts';
COMMENT ON TABLE tracking_session IS 'Tracking sessions for trips and entities';

-- Add comments to important columns
COMMENT ON COLUMN location_tracking.entity_type IS 'Type of entity being tracked: BUS, TOURIST, GUIDE, VEHICLE';
COMMENT ON COLUMN location_tracking.is_offline IS 'Indicates if location was recorded offline and synced later';
COMMENT ON COLUMN point_of_interest.category IS 'POI category: TEMPLE, HISTORICAL, NATURE, RESTAURANT, HOTEL, VIEWPOINT, etc.';
