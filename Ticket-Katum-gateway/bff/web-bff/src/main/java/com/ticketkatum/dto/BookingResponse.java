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
public class BookingResponse {
    private String bookingId;
    private String userId;
    private Long hotelId;
    private String hotelName;
    private String roomType;
    private String checkInDate;
    private String checkOutDate;
    private Integer numberOfGuests;
    private BigDecimal totalAmount;
    private String status; // PENDING, CONFIRMED, CANCELLED, COMPLETED
    private String confirmationNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}