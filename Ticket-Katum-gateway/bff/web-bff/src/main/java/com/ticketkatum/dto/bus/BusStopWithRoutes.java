package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusStopWithRoutes {
    private BusStopDto busStop;
    private List<RouteDto> routes;
    private int routeCount;
}
