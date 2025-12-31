package com.ticketkatum.dto.hotel.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundResponse {
    private boolean success;
    private String message;
    private String refundId;
    private String bookingId;
    private java.math.BigDecimal refundAmount;
    private String refundStatus;
    private String estimatedProcessingTime;
}
