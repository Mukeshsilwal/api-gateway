-- OAuth Integration Database Migration
-- Add OAuth-specific columns to users_table

-- Add provider column (LOCAL, GOOGLE, FACEBOOK, GITHUB)
ALTER TABLE users_table 
ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'LOCAL';

-- Add provider_id column (OAuth provider's user ID)
ALTER TABLE users_table 
ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);

-- Add profile_image_url column (User's profile picture from OAuth)
ALTER TABLE users_table 
ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(255);

-- Add email_verified column (Email verification status from OAuth)
ALTER TABLE users_table 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Create index for faster OAuth user lookups
CREATE INDEX IF NOT EXISTS idx_provider_id ON users_table(provider, provider_id);

-- Update existing users to have provider set to 'LOCAL'
UPDATE users_table 
SET provider = 'LOCAL' 
WHERE provider IS NULL;

-- Comments
COMMENT ON COLUMN users_table.provider IS 'Authentication provider: LOCAL, GOOGLE, FACEBOOK, GITHUB';
COMMENT ON COLUMN users_table.provider_id IS 'Unique user ID from OAuth provider';
COMMENT ON COLUMN users_table.profile_image_url IS 'Profile picture URL from OAuth provider';
COMMENT ON COLUMN users_table.email_verified IS 'Email verification status from OAuth provider';
