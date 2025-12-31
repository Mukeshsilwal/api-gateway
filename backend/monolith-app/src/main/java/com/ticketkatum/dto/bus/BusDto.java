package com.ticketkatum.dto.bus;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BusDto {
    private long routeId;
    @NotNull
    private String busName;
    @NotNull
    private String busType;
    @NotNull
    private LocalDateTime departureDateTime;
    @NotNull
    private BigDecimal basePrice;
    @NotNull
    private BigDecimal maxPrice;

    @NotNull
    private LocalDate date;
    @Nullable
    private List<SeatDto> seats;
    @Nullable
    private RouteDto routeDto;
    private long numberOfSeats;
}
