package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BookingRequestDto {
    private int id;
    private SeatDto seat;
}
