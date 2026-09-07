package com.ticketkatum.model;

import com.ticketkatum.enums.BusType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Bus DTO
 * FIXED: Now matches Bus entity structure
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BusDto {
    private Long id;
    private Long routeId;

    @com.fasterxml.jackson.annotation.JsonProperty("busName")
    @com.fasterxml.jackson.annotation.JsonAlias("name")
    private String busName;

    @com.fasterxml.jackson.annotation.JsonProperty("busType")
    @com.fasterxml.jackson.annotation.JsonAlias("type")
    private BusType busType;

    @com.fasterxml.jackson.annotation.JsonProperty("departureDateTime")
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd['T'][ ]HH:mm[:ss]")
    private LocalDateTime departureDateTime;

    private BigDecimal basePrice;
    private BigDecimal maxPrice;
    private List<SeatDto> seats;
    private long numberOfSeats;
    private LocalDate date;
    private RouteDto routeDto;
}
