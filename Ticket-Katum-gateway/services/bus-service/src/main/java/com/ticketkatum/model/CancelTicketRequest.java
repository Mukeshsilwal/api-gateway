package com.ticketkatum.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelTicketRequest {
    private String email;
    private long ticketNo;
}
