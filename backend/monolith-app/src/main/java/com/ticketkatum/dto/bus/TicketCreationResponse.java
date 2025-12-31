package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCreationResponse {
    private TicketDto ticket;
    private Long ticketId;
    private boolean pdfGenerated;
    private boolean emailSent;
    private String message;
}
