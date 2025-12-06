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
public class BookingHistoryResponse {
    private String bookingId;
    private String hotelName;
    private String checkInDate;
    private String checkOutDate;
    private BigDecimal totalAmount;
    private String bookingStatus;
    private String paymentId;
    private String paymentStatus;
    private String paymentMethod;
    private LocalDateTime bookingDate;
    private String confirmationNumber;
}
