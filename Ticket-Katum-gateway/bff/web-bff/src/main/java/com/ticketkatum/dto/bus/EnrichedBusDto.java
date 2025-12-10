package com.ticketkatum.dto.bus;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrichedBusDto {
    private BusDto bus;
    private RouteDto route;
    private int totalSeats;
    private int availableSeats;
    private double seatAvailability;
}