package com.ticketkatum.market.events;

import com.ticketkatum.market.domain.ProductType;
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
public class ProductOrderedEvent {
    private String eventId;
    private Instant timestamp;
    private long userId;
    private Long productId;
    private String productName;
    private BigDecimal price;
    private ProductType productType;
    private String seatLocation;
    private Long eventIdRef;
}
