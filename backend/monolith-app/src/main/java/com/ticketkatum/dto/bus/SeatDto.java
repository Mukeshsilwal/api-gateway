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
    private Long id;
    @NotNull
    private Long busId;
    private String busName;
    private boolean reserved; // Deprecated, use status
    @NotNull
    private String status; // AVAILABLE, HELD, BOOKED
    private String holdExpiresAt;
    @NotNull
    private String seatNumber;
    @NotNull
    private BigDecimal price;
}
