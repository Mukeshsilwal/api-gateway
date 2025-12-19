package com.ticketkatum.dto.bus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelTicketRequest {
    private String email;
    private long ticketNo;
}
