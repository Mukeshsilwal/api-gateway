package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeInfo {
    private Long showtimeId;
    private String theaterName;
    private String screenName;
    private String showTime;
    private BigDecimal price;
    private Integer availableSeats;
    private String format; // 2D, 3D, IMAX
}
