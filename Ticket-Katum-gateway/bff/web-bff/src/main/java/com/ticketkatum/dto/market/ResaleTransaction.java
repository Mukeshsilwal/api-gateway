package com.ticketkatum.dto.market;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResaleTransaction {

    private UUID id;
    private UUID listingId;
    private UUID buyerUserId;
    private UUID sellerUserId;
    private BigDecimal finalPrice;
    private BigDecimal payoutAmount;
    private LocalDateTime transactionDate;
}
