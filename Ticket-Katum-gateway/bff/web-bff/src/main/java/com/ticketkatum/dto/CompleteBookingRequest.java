package com.ticketkatum.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteBookingRequest {

    @NotNull(message = "Hotel ID is required")
    private Long hotelId;

    @NotBlank(message = "Room type is required")
    private String roomType;

    @NotNull(message = "Check-in date is required")
    private String checkInDate;

    @NotNull(message = "Check-out date is required")
    private String checkOutDate;

    @Min(1)
    private Integer numberOfGuests;

    private String specialRequests;

    @Valid
    @NotNull
    private ContactDetails contactDetails;

    @Valid
    @NotNull
    private PaymentDetails paymentDetails;
}
