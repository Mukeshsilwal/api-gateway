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
public class ResaleListing {

    private UUID id;
    private Long originalTicketId;
    private UUID sellerUserId;
    private UUID eventId;
    private ListingStatus status;
    private BigDecimal faceValue;
    private BigDecimal resalePrice;
    private BigDecimal commissionFee;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
