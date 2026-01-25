-- Drop existing table if it exists
DROP TABLE IF EXISTS products CASCADE;

-- Create products table
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(19, 2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    image_url VARCHAR(500),
    available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_event ON products(event_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);

-- Add comments
COMMENT ON TABLE products IS 'F&B and merchandise products for events';
COMMENT ON COLUMN products.type IS 'Type: F_AND_B, MERCH';

