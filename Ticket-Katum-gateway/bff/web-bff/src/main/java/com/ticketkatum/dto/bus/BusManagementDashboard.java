package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusManagementDashboard {
    private int totalBuses;
    private int totalRoutes;
    private int totalBusStops;
    private int totalSeats;
    private int availableSeats;
    private int bookedSeats;
    private Map<String, Integer> busesByOperator;
    private Map<Integer, Integer> busesPerRoute;
    private double occupancyRate;
    private List<BusDto> recentBuses;
}
