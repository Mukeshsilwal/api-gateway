-- Drop the old trip_type check constraint
ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_trip_type_check;

-- Add new check constraint with updated trip types
ALTER TABLE trips ADD CONSTRAINT trips_trip_type_check 
    CHECK (trip_type IN ('LEISURE', 'BUSINESS', 'ADVENTURE', 'CULTURAL', 'PILGRIMAGE'));

-- Update any existing rows (if any) - set to LEISURE as default
UPDATE trips SET trip_type = 'LEISURE' WHERE trip_type NOT IN ('LEISURE', 'BUSINESS', 'ADVENTURE', 'CULTURAL', 'PILGRIMAGE');
