package com.ticketkatum.enums;

public enum RefundStatus {
    PENDING,           // Refund request created
    PROCESSING,        // Being processed with payment gateway
    COMPLETED,         // Refund successful
    FAILED,           // Refund failed
    CANCELLED          // Refund request cancelled
}
