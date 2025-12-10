package com.ticketkatum.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelAvailabilityRequest {
    @NotNull(message = "Hotel ID is required")
    private Long hotelId;

    @NotNull(message = "Check-in date is required")
    private String checkInDate; // Format: "2025-12-15"

    @NotNull(message = "Check-out date is required")
    private String checkOutDate; // Format: "2025-12-18"

    @NotNull(message = "Number of rooms is required")
    @Min(value = 1, message = "At least 1 room required")
    private Integer numberOfRooms;

    @Min(value = 1, message = "At least 1 guest required")
    private Integer numberOfGuests;
}
