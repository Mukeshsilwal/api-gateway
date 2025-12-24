package com.ticketkatum.market.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListingSoldEvent {
    private String eventId;
    private Instant timestamp;
    private Long transactionId;
    private Long listingId;
    private Long buyerUserId;
    private Long sellerUserId;
    private BigDecimal finalPrice;
    private BigDecimal payoutAmount;
    private Long eventIdRef;
}
