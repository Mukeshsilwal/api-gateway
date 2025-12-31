-- Drop existing table if it exists
DROP TABLE IF EXISTS crowd_zones CASCADE;

-- Create crowd_zones table
CREATE TABLE crowd_zones (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL,
    zone_name VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    current_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'NORMAL',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_crowd_zones_event ON crowd_zones(event_id);
CREATE INDEX idx_crowd_zones_status ON crowd_zones(status);

-- Add comments
COMMENT ON TABLE crowd_zones IS 'Real-time crowd monitoring zones';
COMMENT ON COLUMN crowd_zones.status IS 'Status: NORMAL, MODERATE, CROWDED, FULL';
COMMENT ON COLUMN crowd_zones.current_count IS 'Current number of people in zone';
