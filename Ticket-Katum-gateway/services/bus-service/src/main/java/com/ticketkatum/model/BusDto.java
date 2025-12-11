package com.ticketkatum.model;

import com.ticketkatum.enums.BusType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
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
    // FIXED: Changed from int to Long to match Bus entity
    private Long id;
    
    private String busName;
    
    // FIXED: Changed from String to BusType enum to match Bus entity
    private BusType busType;
    
    private LocalDateTime departureDateTime;
    
    // REMOVED: date field (not in Bus entity)
    
    private BigDecimal basePrice;
    private BigDecimal maxPrice;
    private List<SeatDto> seats;
    private RouteDto routeDto;
}
