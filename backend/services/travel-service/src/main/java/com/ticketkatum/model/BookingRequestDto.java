package com.ticketkatum.model;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class BookingRequestDto {
    private int id;
    private SeatDto seat;
}
