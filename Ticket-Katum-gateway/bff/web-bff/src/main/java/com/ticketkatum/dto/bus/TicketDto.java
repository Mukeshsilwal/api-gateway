package com.ticketkatum.dto.bus;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TicketDto {
    private long ticketNo;
    private BookingTicketDto bookingTicket;

}
