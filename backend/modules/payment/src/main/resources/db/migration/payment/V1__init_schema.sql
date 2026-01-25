-- ============================================================
-- Payment Service - Initial Schema
-- ============================================================
-- Migration: V1__init_schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    txn_id VARCHAR(100),
    amount DOUBLE PRECISION,
    status VARCHAR(20),
    booking_id VARCHAR(100),
    user_id BIGINT,
    transaction_id VARCHAR(100),
    payment_method VARCHAR(50),
    provider VARCHAR(50),
    currency VARCHAR(3) DEFAULT 'NPR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGSERIAL PRIMARY KEY,
    internal_txn_id VARCHAR(100) UNIQUE NOT NULL,
    external_txn_id VARCHAR(100),
    provider VARCHAR(50) NOT NULL,
    amount DECIMAL(19, 2) NOT NULL,
    fee DECIMAL(10, 2),
    net_amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'NPR',
    status VARCHAR(20) NOT NULL,
    user_id VARCHAR(50),
    merchant_id BIGINT,
    description VARCHAR(500),
    metadata TEXT,
    gateway_response TEXT,
    failure_reason VARCHAR(500),
    booking_id VARCHAR(100),
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expired_at TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    callback_url VARCHAR(200),
    success_url VARCHAR(200),
    failure_url VARCHAR(200),
    version BIGINT
);

CREATE TABLE IF NOT EXISTS refunds (
    id BIGSERIAL PRIMARY KEY,
    refund_id VARCHAR(100) UNIQUE NOT NULL,
    ticket_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    booking_id BIGINT NOT NULL,
    original_transaction_id VARCHAR(100) NOT NULL,
    original_external_txn_id VARCHAR(100),
    original_amount DECIMAL(19, 2) NOT NULL,
    processing_fee DECIMAL(19, 2) NOT NULL,
    refund_amount DECIMAL(19, 2) NOT NULL,
    refund_percentage DECIMAL(19, 2) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    esewa_refund_id VARCHAR(100),
    reason TEXT,
    failure_reason TEXT,
    gateway_response TEXT,
    retry_count INTEGER DEFAULT 0,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_payment_methods (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_logs (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT,
    log_level VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
