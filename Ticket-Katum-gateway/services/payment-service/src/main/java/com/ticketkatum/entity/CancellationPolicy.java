package com.ticketkatum.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "cancellation_policies")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancellationPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long eventId; // null means default policy for all events

    @Column(nullable = false)
    private Integer hoursBefore; // Hours before event

    @Column(nullable = false)
    private BigDecimal refundPercentage; // 0-100

    @Column(nullable = false)
    private BigDecimal processingFeePercentage; // 0-100

    @Column(nullable = false)
    private boolean isActive = true;

    // For ordering policies (lowest hours first)
    @Column(nullable = false)
    private Integer priority = 0;
}
