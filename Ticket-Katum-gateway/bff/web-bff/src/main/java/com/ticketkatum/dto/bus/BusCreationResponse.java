package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusCreationResponse {
    private BusDto bus;
    private int seatsCreated;
    private Integer routeId;
    private String message;
}
