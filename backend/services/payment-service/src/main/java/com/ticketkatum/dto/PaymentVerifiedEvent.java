package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Event published to ActiveMQ when payment is verified.
 * Consumed by booking services (hotel-service, event-service) to confirm
 * bookings.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifiedEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Booking reference (e.g., "BKG-123", "HTL-456")
     */
    private String bookingId;

    /**
     * Internal transaction ID from payment service
     */
    private String transactionId;

    /**
     * Merchant/Customer ID
     */
    private Long merchantId;

    /**
     * Payment amount
     */
    private BigDecimal amount;

    /**
     * Payment provider (ESEWA, KHALTI, etc.)
     */
    private String provider;

    /**
     * When payment was verified
     */
    private LocalDateTime verifiedAt;

    /**
     * Type of booking: "HOTEL", "EVENT", "BUS", etc.
     */
    private String bookingType;

    /**
     * External transaction ID from payment gateway
     */
    private String externalTransactionId;

    /**
     * Additional metadata
     */
    private String metadata;
}
