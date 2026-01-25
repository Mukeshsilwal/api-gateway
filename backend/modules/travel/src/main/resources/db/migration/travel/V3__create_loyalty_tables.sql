-- Drop existing tables if they exist
DROP TABLE IF EXISTS point_transactions CASCADE;
DROP TABLE IF EXISTS loyalty_profiles CASCADE;

-- Create loyalty_profiles table
CREATE TABLE loyalty_profiles (
    user_id BIGINT PRIMARY KEY,
    points_balance INTEGER NOT NULL DEFAULT 0,
    lifetime_points INTEGER NOT NULL DEFAULT 0,
    tier_level VARCHAR(50) NOT NULL DEFAULT 'BRONZE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create point_transactions table
CREATE TABLE IF NOT EXISTS point_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount INTEGER NOT NULL,
    source VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES loyalty_profiles(user_id)
);

-- Create indexes
CREATE INDEX idx_loyalty_profiles_tier ON loyalty_profiles(tier_level);
CREATE INDEX idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_created ON point_transactions(created_at DESC);

-- Add comments
COMMENT ON TABLE loyalty_profiles IS 'User loyalty program profiles';
COMMENT ON TABLE point_transactions IS 'History of points earned and redeemed';
COMMENT ON COLUMN loyalty_profiles.tier_level IS 'Tier: BRONZE, SILVER, GOLD';
COMMENT ON COLUMN point_transactions.amount IS 'Positive for earned, negative for redeemed';
