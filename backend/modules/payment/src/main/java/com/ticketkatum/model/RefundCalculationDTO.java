package com.ticketkatum.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundCalculationDTO {
    private Long ticketId;
    private BigDecimal originalAmount;
    private BigDecimal processingFee;
    private BigDecimal refundPercentage;
    private BigDecimal refundAmount;
    private Long hoursUntilEvent;
    private boolean canRefund;
    private String policyDescription;
}
