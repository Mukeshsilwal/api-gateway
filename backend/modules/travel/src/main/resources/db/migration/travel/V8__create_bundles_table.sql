-- Drop existing tables if they exist
DROP TABLE IF EXISTS bundle_items CASCADE;
DROP TABLE IF EXISTS bundles CASCADE;

-- Create bundles table
CREATE TABLE bundles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_price DECIMAL(19, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bundle_items table
CREATE TABLE IF NOT EXISTS bundle_items (
    id BIGSERIAL PRIMARY KEY,
    bundle_id BIGINT NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    item_reference_id VARCHAR(255),
    sub_reference_id VARCHAR(255),
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (bundle_id) REFERENCES bundles(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bundles_active ON bundles(active);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON bundle_items(bundle_id);

-- Add comments
COMMENT ON TABLE bundles IS 'Multi-item package deals (Event + Hotel + Bus)';
COMMENT ON TABLE bundle_items IS 'Individual items within a bundle';
COMMENT ON COLUMN bundle_items.item_type IS 'Type: HOTEL, BUS, EVENT';
