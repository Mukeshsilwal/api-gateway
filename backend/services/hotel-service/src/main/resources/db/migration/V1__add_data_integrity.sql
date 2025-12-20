-- Hotel Service - Data Integrity Migration
-- Phase 1: Add optimistic locking and soft delete support

-- Add version column for optimistic locking to hotels table
ALTER TABLE hotels 
ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT false;

-- Add index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_hotel_deleted ON hotels(deleted);

-- Add version column for optimistic locking to rooms table
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT false;

-- Add index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_room_deleted ON rooms(deleted);

-- Add version column for optimistic locking to room_bookings table
ALTER TABLE room_bookings 
ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

-- Add check constraint to ensure checkout is after checkin
ALTER TABLE room_bookings
ADD CONSTRAINT IF NOT EXISTS check_booking_dates 
CHECK (check_out > check_in);

-- Add constraint to prevent negative guests
ALTER TABLE room_bookings
ADD CONSTRAINT IF NOT EXISTS check_guests_positive 
CHECK (guests_count > 0);

-- Add constraint to ensure positive amounts
ALTER TABLE room_bookings
ADD CONSTRAINT IF NOT EXISTS check_total_positive 
CHECK (total_amount >= 0);

-- Comment on version columns
COMMENT ON COLUMN hotels.version IS 'Optimistic locking version - prevents concurrent modification conflicts';
COMMENT ON COLUMN rooms.version IS 'Optimistic locking version - prevents concurrent modification conflicts';
COMMENT ON COLUMN room_bookings.version IS 'Optimistic locking version - critical for preventing double-booking';

-- Comment on deleted columns
COMMENT ON COLUMN hotels.deleted IS 'Soft delete flag - allows data recovery and audit compliance';
COMMENT ON COLUMN rooms.deleted IS 'Soft delete flag - allows data recovery and audit compliance';
