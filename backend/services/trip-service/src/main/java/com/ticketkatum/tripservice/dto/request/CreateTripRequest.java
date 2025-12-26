package com.ticketkatum.tripservice.dto.request;

import com.ticketkatum.tripservice.entity.Trip;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTripRequest {

    @NotBlank(message = "Trip name is required")
    @Size(min = 3, max = 255, message = "Trip name must be between 3 and 255 characters")
    private String tripName;

    private Long guideId;

    @NotNull(message = "Trip type is required")
    private Trip.TripType tripType;

    @NotNull(message = "Tourist type is required")
    private Trip.TouristType touristType;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @DecimalMin(value = "0.0", inclusive = false, message = "Budget must be greater than 0")
    private BigDecimal budget;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    @AssertTrue(message = "End date must be after start date")
    public boolean isEndDateValid() {
        if (startDate == null || endDate == null) {
            return true; // Let @NotNull handle null validation
        }
        return endDate.isAfter(startDate) || endDate.isEqual(startDate);
    }
}
