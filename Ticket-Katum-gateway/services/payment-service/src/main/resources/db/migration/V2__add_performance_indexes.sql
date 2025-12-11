-- ============================================================
-- Payment Service - Performance Indexes
-- ============================================================
-- Migration: V2__add_performance_indexes.sql
-- ============================================================

-- ============================================================
-- Payments Table Indexes
-- ============================================================

-- User payments
CREATE INDEX IF NOT EXISTS idx_payment_user 
ON payments(user_id, created_at DESC);

-- Transaction reference
CREATE INDEX IF NOT EXISTS idx_payment_transaction 
ON payments(transaction_id);

-- Booking payments
CREATE INDEX IF NOT EXISTS idx_payment_booking 
ON payments(booking_id);

-- Status tracking
CREATE INDEX IF NOT EXISTS idx_payment_status 
ON payments(status, created_at DESC);

-- Pending payments
CREATE INDEX IF NOT EXISTS idx_payment_pending 
ON payments(status, created_at) 
WHERE status = 'PENDING';

-- Failed payments (for retry)
CREATE INDEX IF NOT EXISTS idx_payment_failed 
ON payments(status, created_at DESC) 
WHERE status = 'FAILED';

-- Payment method filter
CREATE INDEX IF NOT EXISTS idx_payment_method 
ON payments(payment_method, created_at DESC);

-- Provider tracking
CREATE INDEX IF NOT EXISTS idx_payment_provider 
ON payments(provider, status);

-- Amount range queries
CREATE INDEX IF NOT EXISTS idx_payment_amount 
ON payments(amount, currency);

-- ============================================================
-- Payment Transactions Table Indexes
-- ============================================================

-- Payment transactions
CREATE INDEX IF NOT EXISTS idx_transaction_payment 
ON payment_transactions(payment_id, created_at DESC);

-- Provider transaction ID
CREATE INDEX IF NOT EXISTS idx_transaction_provider 
ON payment_transactions(provider_transaction_id);

-- Status tracking
CREATE INDEX IF NOT EXISTS idx_transaction_status 
ON payment_transactions(status);

-- ============================================================
-- Refunds Table Indexes
-- ============================================================

-- Payment refunds
CREATE INDEX IF NOT EXISTS idx_refund_payment 
ON refunds(payment_id);

-- Refund status
CREATE INDEX IF NOT EXISTS idx_refund_status 
ON refunds(status, created_at DESC);

-- Pending refunds
CREATE INDEX IF NOT EXISTS idx_refund_pending 
ON refunds(status) 
WHERE status = 'PENDING';

-- User refunds
CREATE INDEX IF NOT EXISTS idx_refund_user 
ON refunds(user_id, created_at DESC);

-- ============================================================
-- Payment Methods Table Indexes
-- ============================================================

-- User payment methods
CREATE INDEX IF NOT EXISTS idx_payment_method_user 
ON user_payment_methods(user_id);

-- Active methods
CREATE INDEX IF NOT EXISTS idx_payment_method_active 
ON user_payment_methods(user_id, is_active) 
WHERE is_active = true;

-- Default method
CREATE INDEX IF NOT EXISTS idx_payment_method_default 
ON user_payment_methods(user_id) 
WHERE is_default = true;

-- ============================================================
-- Payment Logs Table Indexes
-- ============================================================

-- Payment logs
CREATE INDEX IF NOT EXISTS idx_payment_log_payment 
ON payment_logs(payment_id, created_at DESC);

-- Error logs
CREATE INDEX IF NOT EXISTS idx_payment_log_error 
ON payment_logs(log_level, created_at DESC) 
WHERE log_level = 'ERROR';

-- ============================================================
-- Update Statistics
-- ============================================================

ANALYZE payments;
ANALYZE payment_transactions;
ANALYZE refunds;
ANALYZE user_payment_methods;
ANALYZE payment_logs;
