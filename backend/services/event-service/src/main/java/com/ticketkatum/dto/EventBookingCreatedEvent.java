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
public class EventBookingCreatedEvent {
    private Long bookingId;
    private Long tripId;
    private Long userId;
    private Long eventId;
    private String eventName;
    private String location;
    private LocalDateTime eventDate;
    private String ticketType;
    private Integer ticketCount;
    private BigDecimal totalAmount;
    private LocalDateTime startDateTime;
    private String status;
}
