package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancellationResponse {
    private String bookingId;
    private String status;
    private Double refundAmount;
    private String refundStatus;
    private String message;
    private Integer estimatedRefundDays;
    private LocalDateTime timestamp;
}