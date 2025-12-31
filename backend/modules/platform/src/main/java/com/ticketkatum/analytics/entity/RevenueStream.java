package com.ticketkatum.analytics.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "revenue_streams", indexes = {
        @Index(name = "idx_revenue_date", columnList = "date"),
        @Index(name = "idx_revenue_service", columnList = "service_type")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueStream {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "service_type", nullable = false, length = 50)
    private String serviceType; // HOTEL, BUS, GUIDE, EVENT

    @Column(name = "amount", precision = 15, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "transaction_count")
    private Integer transactionCount = 0;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
