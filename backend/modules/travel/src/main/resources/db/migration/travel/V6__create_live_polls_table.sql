-- Drop existing table if it exists
DROP TABLE IF EXISTS live_polls CASCADE;

-- Create live_polls table
CREATE TABLE live_polls (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    vote_counts TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_live_polls_event ON live_polls(event_id);
CREATE INDEX IF NOT EXISTS idx_live_polls_status ON live_polls(status);

-- Add comments
COMMENT ON TABLE live_polls IS 'Live interactive polls during events';
COMMENT ON COLUMN live_polls.status IS 'Status: ACTIVE, CLOSED';
COMMENT ON COLUMN live_polls.options IS 'JSON array of poll options';
COMMENT ON COLUMN live_polls.vote_counts IS 'JSON object mapping options to vote counts';
