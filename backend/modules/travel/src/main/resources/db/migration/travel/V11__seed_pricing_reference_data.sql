-- Hotel Service - Seed Data for Pricing Configuration
-- Insert reference data for RentType, MealPlan, and MealService

-- Insert Rent Types
INSERT INTO rent_type (code, name, description, is_active, created_at, updated_at)
VALUES 
    ('DAILY', 'Daily', 'Daily rental', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('WEEKLY', 'Weekly', 'Weekly rental', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('MONTHLY', 'Monthly', 'Monthly rental', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- Insert Meal Plans
INSERT INTO meal_plan (code, name, description, is_active, created_at, updated_at)
VALUES 
    ('NONE', 'No Meal', 'No meals included', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('BREAKFAST', 'Breakfast', 'Breakfast included', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('HALF_BOARD', 'Half Board', 'Breakfast and dinner included', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('FULL_BOARD', 'Full Board', 'All meals included', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;
