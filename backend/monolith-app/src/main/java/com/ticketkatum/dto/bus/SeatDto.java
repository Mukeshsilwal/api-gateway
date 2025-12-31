package com.ticketkatum.dto.bus;


import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SeatDto {
    @NotNull
    private Long busId;
    @NotNull
    private String busName;
    @NotNull
    private boolean reserved; // Deprecated, use status
    @NotNull
    private String status; // AVAILABLE, HELD, BOOKED
    @NotNull
    private String holdExpiresAt;
    @NotNull
    private String seatNumber;
    @NotNull
    private BigDecimal price;
}
