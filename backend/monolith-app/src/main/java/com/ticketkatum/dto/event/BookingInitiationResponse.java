package com.ticketkatum.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingInitiationResponse {
    private String bookingReference;
    private String htmlForm;
    private String paymentUrl;
    private String transactionId;
    private String status;
    private String message;
    private String error;
}
