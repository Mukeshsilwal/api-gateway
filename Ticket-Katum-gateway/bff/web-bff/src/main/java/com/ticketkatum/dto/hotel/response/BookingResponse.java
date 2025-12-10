package com.ticketkatum.dto.hotel.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private boolean success;
    private String message;
    private String bookingId;
    private String bookingReference;
    private String status;
    private java.math.BigDecimal totalAmount;
    private String paymentStatus;
    private Map<String, Object> bookingDetails;
}
