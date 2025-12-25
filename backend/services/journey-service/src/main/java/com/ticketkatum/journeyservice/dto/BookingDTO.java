package com.ticketkatum.journeyservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for booking data from booking-service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long bookingId;
    private String bookingType;
    private String bookingReference;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String locationFrom;
    private String locationTo;
    private BigDecimal amount;
    private String status;
}
