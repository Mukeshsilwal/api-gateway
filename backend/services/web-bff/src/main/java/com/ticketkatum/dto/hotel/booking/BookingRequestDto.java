package com.ticketkatum.dto.hotel.booking;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDto {
    private Long hotelId;
    private String roomType;
    private Long rentTypeId;
    private Long mealPlanId;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private Integer guestsCount;
    private String specialRequests;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
}
