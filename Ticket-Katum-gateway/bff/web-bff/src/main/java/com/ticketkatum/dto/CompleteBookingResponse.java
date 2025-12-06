package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteBookingResponse {
    private String bookingId;
    private String paymentId;
    private String status;
    private BigDecimal totalAmount;
    private String hotelName;
    private String checkInDate;
    private String checkOutDate;
    private String confirmationNumber;
    private String paymentUrl; // For redirect to payment gateway
    private LocalDateTime timestamp;
}

