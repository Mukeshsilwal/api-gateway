package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BookingTicketDto {
    private long bookingId;
    private String fullName;
    private Long userId;
    private String email;
    private String status;
    private List<Long> seatIds;
}
