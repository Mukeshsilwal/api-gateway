package com.ticketkatum.tripservice.dto.request;

import com.ticketkatum.tripservice.entity.Trip;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
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
public class UpdateTripRequest {
    
    @Size(min = 3, max = 255, message = "Trip name must be between 3 and 255 characters")
    private String tripName;
    
    private Trip.TripStatus status;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Budget must be greater than 0")
    private BigDecimal budget;
    
    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;
}
