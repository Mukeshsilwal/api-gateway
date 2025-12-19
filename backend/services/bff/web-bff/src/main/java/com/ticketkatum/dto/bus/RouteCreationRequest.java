package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteCreationRequest {
    private RouteDto routeDto;
    private Long sourceStopId;
    private Long destinationStopId;
}
