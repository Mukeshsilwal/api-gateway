-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS pricing_rules CASCADE;

-- Create pricing_rules table
CREATE TABLE pricing_rules (
    id BIGSERIAL PRIMARY KEY,
    rule_type VARCHAR(50) NOT NULL,
    condition_value DOUBLE PRECISION NOT NULL,
    multiplier DOUBLE PRECISION NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pricing_rules_active ON pricing_rules(active);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_priority ON pricing_rules(priority ASC);

-- Insert default pricing rules
INSERT INTO pricing_rules (rule_type, condition_value, multiplier, priority, description) VALUES
('SCARCITY', 0.10, 1.5, 1, 'Apply 1.5x multiplier when availability < 10%'),
('SCARCITY', 0.05, 2.0, 2, 'Apply 2.0x multiplier when availability < 5%'),
('TIME_BASED', 24.0, 1.2, 3, 'Apply 1.2x multiplier when < 24 hours to event'),
('TIME_BASED', 6.0, 1.5, 4, 'Apply 1.5x multiplier when < 6 hours to event');

-- Add comments
COMMENT ON TABLE pricing_rules IS 'Dynamic pricing rules for demand-based pricing';
COMMENT ON COLUMN pricing_rules.rule_type IS 'Type: SCARCITY, TIME_BASED';
COMMENT ON COLUMN pricing_rules.condition_value IS 'Threshold value (percentage or hours)';
COMMENT ON COLUMN pricing_rules.multiplier IS 'Price multiplier when rule applies';
