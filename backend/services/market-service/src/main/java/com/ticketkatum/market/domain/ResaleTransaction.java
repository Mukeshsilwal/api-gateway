package com.ticketkatum.market.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "resale_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResaleTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private long listingId;

    @Column(nullable = false)
    private long buyerUserId;

    @Column(nullable = false)
    private long sellerUserId;

    @Column(nullable = false)
    private BigDecimal finalPrice;

    @Column(nullable = false)
    private BigDecimal payoutAmount;

    @Column(nullable = false, updatable = false)
    private LocalDateTime transactionDate;

    @PrePersist
    protected void onCreate() {
        transactionDate = LocalDateTime.now();
    }
}
