package com.ticketkatum.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promo_codes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromoCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long eventId;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false)
    private BigDecimal discountValue;

    private Integer maxUses;

    @Column(nullable = false)
    private Integer currentUses = 0;

    private LocalDateTime validFrom;
    private LocalDateTime validUntil;

    private BigDecimal minPurchaseAmount;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum DiscountType {
        PERCENTAGE,
        FIXED_AMOUNT
    }

    public boolean isValid() {
        if (!active)
            return false;
        LocalDateTime now = LocalDateTime.now();
        if (validFrom != null && now.isBefore(validFrom))
            return false;
        if (validUntil != null && now.isAfter(validUntil))
            return false;
        if (maxUses != null && currentUses >= maxUses)
            return false;
        return true;
    }

    public BigDecimal calculateDiscount(BigDecimal amount) {
        if (!isValid())
            return BigDecimal.ZERO;
        if (minPurchaseAmount != null && amount.compareTo(minPurchaseAmount) < 0) {
            return BigDecimal.ZERO;
        }

        if (discountType == DiscountType.PERCENTAGE) {
            return amount.multiply(discountValue).divide(new BigDecimal(100));
        } else {
            return discountValue.min(amount);
        }
    }
}
