package com.ticketkatum.market.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BundleBookedEvent {
    private String eventId;
    private Instant timestamp;
    private Long bundleId;
    private String bundleName;
    private UUID userId;
    private BigDecimal totalPrice;
    private BigDecimal discountPercentage;
    private int itemCount;
}
