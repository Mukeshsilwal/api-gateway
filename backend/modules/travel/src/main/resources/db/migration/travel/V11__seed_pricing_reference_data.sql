-- Hotel Service - Seed Data for Pricing Configuration
-- Insert reference data for RentType, MealPlan, and MealService

-- Create Rent Types table if not exists
CREATE TABLE IF NOT EXISTS rent_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    duration_hours INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Meal Plans table if not exists
CREATE TABLE IF NOT EXISTS meal_plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Rent Types
INSERT INTO rent_types (code, name, duration_hours, is_active, created_at, updated_at)
VALUES 
    ('HOURLY', 'Hourly', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DAILY', 'Daily', 24, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('WEEKLY', 'Weekly', 168, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('MONTHLY', 'Monthly', 720, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- Insert Meal Plans
INSERT INTO meal_plans (code, name, description, is_active, created_at, updated_at)
VALUES 
    ('NONE', 'No Meal', 'No meals included', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('BREAKFAST', 'Breakfast', 'Breakfast included', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('HALF_BOARD', 'Half Board', 'Breakfast and dinner included', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('FULL_BOARD', 'Full Board', 'All meals included', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;
