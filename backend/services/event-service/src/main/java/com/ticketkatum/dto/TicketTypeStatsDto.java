package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Ticket Type Statistics DTO
 * Analytics breakdown per ticket type
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketTypeStatsDto {
    private Long ticketTypeId;
    private String ticketTypeName;
    private BigDecimal price;
    private Integer totalQuantity;
    private Integer soldQuantity;
    private Integer remainingQuantity;
    private BigDecimal revenue;
    private Double sellThroughRate; // (sold / total) * 100
}
