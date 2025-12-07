package com.ticketkatum.dto.hotel.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancellationResponse {
    private boolean success;
    private String message;
    private String bookingId;
    private String cancellationId;
    private BigDecimal refundAmount;
    private String refundStatus;
    private Map<String, Object> cancellationDetails;
}