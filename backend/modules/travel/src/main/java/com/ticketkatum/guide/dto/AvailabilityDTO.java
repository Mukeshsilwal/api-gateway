package com.ticketkatum.guide.dto;

import com.ticketkatum.guide.entity.GuideAvailability;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityDTO {

    private Long id;
    
    @NotNull(message = "Guide ID is required")
    private Long guideId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private String status;
    private Long bookingId;

    public static AvailabilityDTO fromEntity(GuideAvailability availability) {
        return AvailabilityDTO.builder()
                .id(availability.getId())
                .guideId(availability.getGuide().getGuideId())
                .date(availability.getDate())
                .status(availability.getStatus().name())
                .bookingId(availability.getBookingId())
                .build();
    }
}
