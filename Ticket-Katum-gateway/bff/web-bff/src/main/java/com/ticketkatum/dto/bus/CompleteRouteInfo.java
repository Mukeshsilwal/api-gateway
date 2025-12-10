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
public class CompleteRouteInfo {
    private RouteDto route;
    private List<BusStopDto> busStops;
    private List<BusDto> buses;
    private int totalBuses;
    private double totalDistance;
    private String estimatedDuration;
}
