package com.ticketkatum.dto.hotel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailability {
    private Long roomId;
    private String roomNumber;
    private boolean available;
    private String reason;
    private BigDecimal pricePerNight;
}
