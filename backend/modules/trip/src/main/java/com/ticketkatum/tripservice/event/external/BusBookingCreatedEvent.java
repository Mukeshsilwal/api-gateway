package com.ticketkatum.tripservice.event.external;

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
public class BusBookingCreatedEvent {
    private Long bookingId;
    private Long tripId;
    private Long userId;
    private String source;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String operatorName;
    private String busType;
    private java.util.List<String> seatNumbers;
    private BigDecimal totalAmount;
}
