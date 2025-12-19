package com.ticketkatum.market.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "resale_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResaleTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID listingId;

    @Column(nullable = false)
    private UUID buyerUserId;

    @Column(nullable = false)
    private UUID sellerUserId;

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
