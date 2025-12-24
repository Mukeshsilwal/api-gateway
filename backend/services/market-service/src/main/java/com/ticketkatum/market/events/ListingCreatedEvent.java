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
public class ListingCreatedEvent {
    private String eventId;
    private Instant timestamp;
    private Long listingId;
    private Long originalTicketId;
    private Long sellerUserId;
    private Long eventIdRef;
    private BigDecimal resalePrice;
    private BigDecimal faceValue;
    private BigDecimal commissionFee;
}
