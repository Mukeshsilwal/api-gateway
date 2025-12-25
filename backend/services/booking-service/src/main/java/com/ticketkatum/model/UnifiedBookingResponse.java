package com.ticketkatum.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Response model for unified booking operations.
 * Contains aggregated results from multiple booking types.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnifiedBookingResponse {

    private String transactionId;
    private String customerId;
    private Long tripId; // Trip ID if bookings are associated with a trip
    private List<BookingResult> bookings;
    private PaymentInfo paymentInfo;
    private BigDecimal totalAmount;
    private String status; // SUCCESS, PARTIAL_SUCCESS, FAILED
    private Instant createdAt;
    private String message;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingResult {
        private String type; // EVENT, BUS, HOTEL
        private String bookingId;
        private String confirmationNumber;
        private String status; // SUCCESS, FAILED
        private BigDecimal amount;
        private String message;
        private Object details; // Type-specific booking details
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentInfo {
        private String paymentId;
        private String paymentMethod;
        private String paymentStatus; // PENDING, COMPLETED, FAILED
        private BigDecimal amount;
        private String currency;
        private String paymentUrl; // For redirect-based payments
    }
}
