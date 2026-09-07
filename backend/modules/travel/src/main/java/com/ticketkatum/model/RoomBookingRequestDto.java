package com.ticketkatum.model;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class RoomBookingRequestDto {

    private Long roomId;

    private Long hotelId;

    private String roomType;

    private Long rentTypeId;

    private Long mealPlanId;

    @NotNull(message = "Check-in time is required")
    private LocalDateTime checkIn;

    @NotNull(message = "Check-out time is required")
    private LocalDateTime checkOut;

    private Integer guestsCount;

    private String specialRequests;

    // Customer details
    private String customerName;

    private String customerEmail;

    private String customerPhone;
}
