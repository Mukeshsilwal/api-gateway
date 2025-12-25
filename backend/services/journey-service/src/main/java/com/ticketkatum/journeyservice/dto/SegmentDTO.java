package com.ticketkatum.journeyservice.dto;

import com.ticketkatum.journeyservice.entity.JourneySegment;
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
public class SegmentDTO {

    private Long segmentId;
    private Integer sequenceOrder;
    private JourneySegment.SegmentType segmentType;
    private LocalDateTime startTime;
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
    private BigDecimal actualCost;
    private JourneySegment.SegmentStatus status;
    private String notes;
}
