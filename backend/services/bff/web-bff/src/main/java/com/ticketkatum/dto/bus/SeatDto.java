package com.ticketkatum.dto.bus;


import lombok.*;

import java.math.BigDecimal;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SeatDto {
    private Long busId;
    private boolean reserved; // Deprecated, use status
    private String status; // AVAILABLE, HELD, BOOKED
    private String holdExpiresAt;
    private String seatNumber;
    private BigDecimal price;
}
