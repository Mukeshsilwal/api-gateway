package com.ticketkatum.webbff.dto.market;

import lombok.Data;

import java.util.UUID;

@Data
public class LoyaltyProfileDTO {
    private UUID userId;
    private int pointsBalance;
    private String tierLevel;
}
