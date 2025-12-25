-- Guide Service Database Schema
-- Version: 1.0
-- Description: Schema for Guide Profiles, Packages, Availability, and Reviews

-- Create guides table
CREATE TABLE IF NOT EXISTS guides (
    guide_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE, -- Link to Auth User
    full_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50),
    years_experience INTEGER,
    bio TEXT,
    profile_image_url VARCHAR(255),
    verification_status VARCHAR(20) DEFAULT 'PENDING',
    rating DECIMAL(3, 2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guides_user ON guides(user_id);
CREATE INDEX idx_guides_status ON guides(verification_status, is_active);

-- Create guide_specialties table
CREATE TABLE IF NOT EXISTS guide_specialties (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES guides(guide_id) ON DELETE CASCADE,
    specialty VARCHAR(50) NOT NULL,
    UNIQUE(guide_id, specialty)
);

CREATE INDEX idx_specialties_guide ON guide_specialties(guide_id);
CREATE INDEX idx_specialties_name ON guide_specialties(specialty);

-- Create guide_languages table
CREATE TABLE IF NOT EXISTS guide_languages (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES guides(guide_id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    proficiency VARCHAR(20) DEFAULT 'FLUENT',
    UNIQUE(guide_id, language)
);

CREATE INDEX idx_languages_guide ON guide_languages(guide_id);
CREATE INDEX idx_languages_name ON guide_languages(language);

-- Create service_packages table
CREATE TABLE IF NOT EXISTS service_packages (
    package_id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES guides(guide_id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    duration_hours INTEGER,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NPR',
    max_group_size INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_packages_guide ON service_packages(guide_id);

-- Create guide_availability table
CREATE TABLE IF NOT EXISTS guide_availability (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES guides(guide_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    booking_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(guide_id, date)
);

CREATE INDEX idx_availability_guide_date ON guide_availability(guide_id, date);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    review_id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT NOT NULL REFERENCES guides(guide_id) ON DELETE CASCADE,
    reviewer_id BIGINT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_guide ON reviews(guide_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON service_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE guides IS 'Verified tourist guides profiles';
COMMENT ON TABLE service_packages IS 'Tour packages offered by guides';
COMMENT ON TABLE guide_availability IS 'Calendar availability for guides';
