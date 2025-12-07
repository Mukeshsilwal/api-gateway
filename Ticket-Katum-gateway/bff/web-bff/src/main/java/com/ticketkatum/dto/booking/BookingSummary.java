package com.ticketkatum.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingSummary {
    private String bookingId;
    private String bookingReference;
    private String hotelName;
    private String status;
    private String checkIn;
    private String checkOut;
    private java.math.BigDecimal totalAmount;
    private LocalDateTime bookingDate;
}
