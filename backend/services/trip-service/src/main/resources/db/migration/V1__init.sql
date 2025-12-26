CREATE TABLE trips (
    trip_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    trip_name VARCHAR(255) NOT NULL,
    trip_type VARCHAR(50) NOT NULL,
    tourist_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE trip_checkpoints (
    checkpoint_id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL REFERENCES trips(trip_id),
    checkpoint_type VARCHAR(50) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    actual_time TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    notes TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE trip_bookings (
    booking_id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL REFERENCES trips(trip_id),
    booking_reference_id BIGINT NOT NULL, -- ID from Booking Service
    booking_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    booking_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE trip_participants (
    participant_id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL REFERENCES trips(trip_id),
    user_id BIGINT NOT NULL, -- Can be null if guest? Entity says user_id, let's assume not null
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);
