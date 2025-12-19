package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCreationRequest {
    private TicketDto ticketDto;
    private Long seatId;
    private Long bookingId;
}
