package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteCreationResponse {
    private RouteDto route;
    private BusStopDto sourceStop;
    private BusStopDto destinationStop;
    private String message;
}
