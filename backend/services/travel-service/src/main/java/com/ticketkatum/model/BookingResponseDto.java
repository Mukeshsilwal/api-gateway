package com.ticketkatum.model;

import com.ticketkatum.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponseDto {
    private Long id;
    private String bookingReference;
    private String roomNumber;
    private String roomType;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private String rentType;
    private String mealPlan;
    private Integer guestsCount;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private String customerName;
    private String customerEmail;
    private LocalDateTime createdAt;
}