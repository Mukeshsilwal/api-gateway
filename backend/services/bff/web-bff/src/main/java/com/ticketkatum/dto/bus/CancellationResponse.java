package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancellationResponse {
    private boolean success;
    private String message;
    private String email;
    private String ticketNo;
    private String refundStatus;
}
