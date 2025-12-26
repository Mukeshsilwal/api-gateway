-- Insert Rent Types
INSERT INTO rent_types (name, code, duration_hours, is_active, created_at, updated_at)
VALUES 
('Daily', 'DAILY', 24, true, NOW(), NOW()),
('Weekly', 'WEEKLY', 168, true, NOW(), NOW()),
('Monthly', 'MONTHLY', 720, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Insert Meal Plans (Matching Frontend Constants in AddRoomModal.tsx)
INSERT INTO meal_plans (name, code, description, is_active, created_at, updated_at)
VALUES 
('No Meal', 'NONE', 'Accommodation only, no meals included.', true, NOW(), NOW()),
('Breakfast Included', 'BREAKFAST', 'Accommodation with breakfast.', true, NOW(), NOW()),
('Half Board', 'HALF_BOARD', 'Breakfast and dinner included.', true, NOW(), NOW()),
('Full Board', 'FULL_BOARD', 'Breakfast, lunch, and dinner included.', true, NOW(), NOW()),
('All Inclusive', 'ALL_INCLUSIVE', 'All meals and drinks included.', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;
