-- Add OAuth support columns to users_table
ALTER TABLE users_table ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users_table ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(255);
ALTER TABLE users_table ADD COLUMN IF NOT EXISTS provider VARCHAR(50);
ALTER TABLE users_table ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);

-- Update existing users to have email_verified = true (assuming they're already verified)
UPDATE users_table SET email_verified = true WHERE email_verified IS NULL;
