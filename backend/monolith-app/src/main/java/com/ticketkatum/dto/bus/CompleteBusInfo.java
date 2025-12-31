package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

// Aggregated Response DTOs
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CompleteBusInfo {
    private BusDto bus;
    private RouteDto route;
    private List<BusStopDto> busStops;
    private List<SeatDto> seats;
    private int totalSeats;
    private int availableSeats;
    private int bookedSeats;
    private double seatAvailability;
}