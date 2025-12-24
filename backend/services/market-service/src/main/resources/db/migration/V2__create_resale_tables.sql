-- Drop existing tables if they exist
DROP TABLE IF EXISTS resale_transactions CASCADE;
DROP TABLE IF EXISTS resale_listings CASCADE;

-- Create resale_listings table
CREATE TABLE resale_listings (
    id BIGSERIAL PRIMARY KEY,
    original_ticket_id BIGINT NOT NULL,
    seller_user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    face_value DECIMAL(19, 2) NOT NULL,
    resale_price DECIMAL(19, 2) NOT NULL,
    commission_fee DECIMAL(19, 2) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create resale_transactions table
CREATE TABLE IF NOT EXISTS resale_transactions (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL,
    buyer_user_id BIGINT NOT NULL,
    seller_user_id BIGINT NOT NULL,
    final_price DECIMAL(19, 2) NOT NULL,
    payout_amount DECIMAL(19, 2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES resale_listings(id)
);

-- Create indexes
CREATE INDEX idx_resale_listings_event_id ON resale_listings(event_id);
CREATE INDEX idx_resale_listings_status ON resale_listings(status);
CREATE INDEX idx_resale_listings_seller ON resale_listings(seller_user_id);
CREATE INDEX idx_resale_transactions_listing ON resale_transactions(listing_id);
CREATE INDEX idx_resale_transactions_buyer ON resale_transactions(buyer_user_id);

-- Add comments
COMMENT ON TABLE resale_listings IS 'Secondary market ticket listings';
COMMENT ON TABLE resale_transactions IS 'Completed resale transactions';
COMMENT ON COLUMN resale_listings.status IS 'Status: ACTIVE, SOLD, EXPIRED, CANCELLED';
