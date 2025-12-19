-- ============================================================
-- Bus Service - Performance Indexes
-- ============================================================
-- Migration: V2__add_performance_indexes.sql
-- ============================================================

-- ============================================================
-- Routes Table Indexes
-- ============================================================

-- Route search (origin + destination)
CREATE INDEX IF NOT EXISTS idx_route_search 
ON routes(origin_city, destination_city);

-- Active routes
CREATE INDEX IF NOT EXISTS idx_route_active 
ON routes(is_active) 
WHERE is_active = true;

-- Distance-based queries
CREATE INDEX IF NOT EXISTS idx_route_distance 
ON routes(distance_km);

-- ============================================================
-- Buses Table Indexes
-- ============================================================

-- Operator buses
CREATE INDEX IF NOT EXISTS idx_bus_operator 
ON buses(operator_id);

-- Bus type filter
CREATE INDEX IF NOT EXISTS idx_bus_type 
ON buses(bus_type);

-- Active buses
CREATE INDEX IF NOT EXISTS idx_bus_active 
ON buses(is_active, operator_id) 
WHERE is_active = true;

-- Capacity filter
CREATE INDEX IF NOT EXISTS idx_bus_capacity 
ON buses(total_seats);

-- ============================================================
-- Schedules Table Indexes
-- ============================================================

-- Route schedules
CREATE INDEX IF NOT EXISTS idx_schedule_route 
ON schedules(route_id, departure_time);

-- Bus schedules
CREATE INDEX IF NOT EXISTS idx_schedule_bus 
ON schedules(bus_id, departure_date);

-- Date-based search
CREATE INDEX IF NOT EXISTS idx_schedule_date 
ON schedules(departure_date, route_id);

-- Active schedules
CREATE INDEX IF NOT EXISTS idx_schedule_active 
ON schedules(is_active, departure_date) 
WHERE is_active = true;

-- Composite search index
CREATE INDEX IF NOT EXISTS idx_schedule_search 
ON schedules(route_id, departure_date, is_active);

-- ============================================================
-- Seats Table Indexes
-- ============================================================

-- Schedule seats
CREATE INDEX IF NOT EXISTS idx_seat_schedule 
ON seats(schedule_id, seat_number);

-- Available seats
CREATE INDEX IF NOT EXISTS idx_seat_available 
ON seats(schedule_id, is_booked) 
WHERE is_booked = false;

-- Seat type filter
CREATE INDEX IF NOT EXISTS idx_seat_type 
ON seats(seat_type, schedule_id);

-- ============================================================
-- Tickets Table Indexes
-- ============================================================

-- User tickets
CREATE INDEX IF NOT EXISTS idx_ticket_user 
ON tickets(user_id, booking_date DESC);

-- Schedule tickets
CREATE INDEX IF NOT EXISTS idx_ticket_schedule 
ON tickets(schedule_id);

-- PNR lookup
CREATE INDEX IF NOT EXISTS idx_ticket_pnr 
ON tickets(pnr);

-- Status filter
CREATE INDEX IF NOT EXISTS idx_ticket_status 
ON tickets(status, booking_date DESC);

-- Payment tracking
CREATE INDEX IF NOT EXISTS idx_ticket_payment 
ON tickets(payment_id, payment_status);

-- ============================================================
-- Operators Table Indexes
-- ============================================================

-- Active operators
CREATE INDEX IF NOT EXISTS idx_operator_active 
ON operators(is_active) 
WHERE is_active = true;

-- Rating filter
CREATE INDEX IF NOT EXISTS idx_operator_rating 
ON operators(rating DESC);

-- ============================================================
-- Update Statistics
-- ============================================================

ANALYZE routes;
ANALYZE buses;
ANALYZE schedules;
ANALYZE seats;
ANALYZE tickets;
ANALYZE operators;
