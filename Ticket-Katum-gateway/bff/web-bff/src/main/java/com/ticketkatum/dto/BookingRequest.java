package com.ticketkatum.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotNull(message = "Hotel ID is required")
    private Long hotelId;

    @NotBlank(message = "Room type is required")
    private String roomType;

    @NotNull(message = "Check-in date is required")
    @Future(message = "Check-in date must be in the future")
    private String checkInDate;

    @NotNull(message = "Check-out date is required")
    private String checkOutDate;

    @Min(value = 1, message = "At least one guest required")
    @Max(value = 10, message = "Maximum 10 guests allowed")
    private Integer numberOfGuests;

    private String specialRequests;

    @Valid
    @NotNull(message = "Contact details are required")
    private ContactDetails contactDetails;

    @Valid
    @NotNull(message = "Payment details are required")
    private PaymentDetails paymentDetails;
}