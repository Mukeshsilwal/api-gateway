package com.ticketkatum.journeyservice.dto;

import com.ticketkatum.journeyservice.entity.JourneySegment;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSegmentRequest {

    @NotNull(message = "Segment type is required")
    private JourneySegment.SegmentType segmentType;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    private String locationFrom;
    private String locationTo;
    
    private BigDecimal latitudeFrom;
    private BigDecimal longitudeFrom;
    private BigDecimal latitudeTo;
    private BigDecimal longitudeTo;

    private String bookingReference;
    private String bookingType;
    private Long bookingId;

    private BigDecimal estimatedCost;
    private String notes;
}
