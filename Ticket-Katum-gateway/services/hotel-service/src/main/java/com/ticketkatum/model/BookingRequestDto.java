package com.ticketkatum.model;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDto {
    @NotNull(message = "Hotel ID is required")
    private Long hotelId;

    @NotNull(message = "Room type is required")
    private String roomType;

    @NotNull(message = "Rent type is required")
    private Long rentTypeId;

    @NotNull(message = "Meal plan is required")
    private Long mealPlanId;

    @NotNull(message = "Check-in time is required")
    @Future(message = "Check-in must be in the future")
    private LocalDateTime checkIn;

    @NotNull(message = "Check-out time is required")
    @Future(message = "Check-out must be in the future")
    private LocalDateTime checkOut;

    @NotNull(message = "Guest count is required")
    @Min(value = 1, message = "At least 1 guest required")
    private Integer guestsCount;

    private String specialRequests;

    // Customer details
    @NotBlank(message = "Customer name is required")
    private String customerName;

    @Email(message = "Valid email is required")
    private String customerEmail;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Valid phone number is required")
    private String customerPhone;
}
