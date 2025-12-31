package com.ticketkatum.dto.market;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateListingRequest {
    @NotNull
    private Long originalTicketId;

    @NotNull
    private UUID sellerUserId;

    @NotNull
    private UUID eventId;

    @NotNull
    @Positive
    private BigDecimal resalePrice;
}
