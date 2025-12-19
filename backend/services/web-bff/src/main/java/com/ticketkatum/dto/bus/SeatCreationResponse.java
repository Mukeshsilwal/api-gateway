package com.ticketkatum.dto.bus;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class SeatCreationResponse {
    private Long busId;
    private SeatDto seat;
    private String message;
}
