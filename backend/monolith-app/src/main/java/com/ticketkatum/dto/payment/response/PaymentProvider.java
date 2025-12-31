package com.ticketkatum.dto.payment.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentProvider {
    private String id;
    private String name;
    private String logo;
    private boolean enabled;
    private BigDecimal maxAmount;
    private String currency;
}
