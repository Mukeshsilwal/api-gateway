package com.ticketkatum.dto.hotel.booking;

import com.ticketkatum.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
