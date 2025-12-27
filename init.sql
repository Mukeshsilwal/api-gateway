-- Create databases for all microservices
-- Note: PostgreSQL docker image only creates one DB by default (POSTGRES_DB env var).
-- This script runs on first startup to create the others.

CREATE DATABASE auth_db;
CREATE DATABASE booking_db;
CREATE DATABASE payment_db;
CREATE DATABASE hotel_db;
CREATE DATABASE bus_db;
CREATE DATABASE market_db;
CREATE DATABASE event_db;

-- Optional: Create specific users if your services use different credentials
-- CREATE USER ticket_user WITH PASSWORD 'secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE auth_db TO ticket_user;
-- ...
