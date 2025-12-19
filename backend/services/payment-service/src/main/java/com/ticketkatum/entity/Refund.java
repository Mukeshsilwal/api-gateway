package com.ticketkatum.entity;

import com.ticketkatum.enums.RefundStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "refunds")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String refundId;

    @Column(nullable = false)
    private Long ticketId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long bookingId;

    @Column(nullable = false)
    private String originalTransactionId; // Internal TXN ID from PaymentTransaction

    private String originalExternalTxnId; // eSewa transaction ID

    @Column(nullable = false)
    private BigDecimal originalAmount;

    @Column(nullable = false)
    private BigDecimal processingFee;

    @Column(nullable = false)
    private BigDecimal refundAmount;

    @Column(nullable = false)
    private BigDecimal refundPercentage;

    @Column(nullable = false)
    private String provider; // esewa, khalti, etc.

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RefundStatus status;

    private String esewaRefundId; // eSewa's refund reference

    @Column(length = 1000)
    private String reason;

    @Column(length = 2000)
    private String failureReason;

    @Column(length = 5000)
    private String gatewayResponse;

    private Integer retryCount = 0;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime requestedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime processedAt;

    private LocalDateTime completedAt;

    private LocalDateTime failedAt;
}
