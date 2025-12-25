-- Analytics Service Database Schema
-- Version: 1.0
-- Description: Schema for aggregated metrics and operational logs

-- Create daily_metrics table (Aggregated stats)
CREATE TABLE IF NOT EXISTS daily_metrics (
    date DATE PRIMARY KEY,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_signups INTEGER DEFAULT 0,
    sos_alerts_triggered INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create revenue_streams table (Breakdown by service)
CREATE TABLE IF NOT EXISTS revenue_streams (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    service_type VARCHAR(50) NOT NULL, -- HOTEL, BUS, GUIDE, EVENT
    amount DECIMAL(15, 2) DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_revenue_date ON revenue_streams(date);
CREATE INDEX idx_revenue_service ON revenue_streams(service_type);

-- Create destination_stats table (Popularity tracking)
CREATE TABLE IF NOT EXISTS destination_stats (
    id BIGSERIAL PRIMARY KEY,
    location_name VARCHAR(100) NOT NULL,
    search_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_name)
);

CREATE INDEX idx_dest_booking ON destination_stats(booking_count DESC);

-- Create system_events table (Audit log)
CREATE TABLE IF NOT EXISTS system_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    service_source VARCHAR(50),
    severity VARCHAR(20) DEFAULT 'INFO',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_created ON system_events(created_at DESC);
CREATE INDEX idx_events_severity ON system_events(severity);

-- Add comments
COMMENT ON TABLE daily_metrics IS 'Daily aggregated KPIs for the platform';
COMMENT ON TABLE revenue_streams IS 'Revenue breakdown by line of business per day';
COMMENT ON TABLE destination_stats IS 'Tracking popular destinations based on searches and bookings';
