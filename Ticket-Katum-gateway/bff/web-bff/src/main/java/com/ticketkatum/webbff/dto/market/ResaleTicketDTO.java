package com.ticketkatum.webbff.dto.market;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ResaleTicketDTO {
    private UUID id;
    private UUID originalBookingId;
    private BigDecimal price;
    private String status;
}
