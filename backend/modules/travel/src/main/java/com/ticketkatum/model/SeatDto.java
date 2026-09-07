package com.ticketkatum.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class SeatDto {
    private Long id;
    private Long busId;
    private boolean reserved; // Deprecated, use status
    private String status; // AVAILABLE, HELD, BOOKED
    private String holdExpiresAt;
    private String seatNumber;
    private BigDecimal price;
    private String busName;

}
