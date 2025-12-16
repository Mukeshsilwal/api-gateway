package com.ticketkatum.entity;

import com.ticketkatum.enums.TransactionStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions", indexes = {
        @Index(name = "idx_internal_txn_id", columnList = "internalTxnId"),
        @Index(name = "idx_external_txn_id", columnList = "externalTxnId"),
        @Index(name = "idx_user_id", columnList = "userId"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_created_at", columnList = "createdAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String internalTxnId; // Your system's transaction ID

    @Column(length = 100)
    private String externalTxnId; // Gateway's transaction ID

    @Column(nullable = false, length = 50)
    private String provider; // esewa, khalti, imepay

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(precision = 10, scale = 2)
    private BigDecimal fee; // Transaction fee

    @Column(precision = 10, scale = 2)
    private BigDecimal netAmount; // Amount after fee

    @Column(nullable = false, length = 3)
    private String currency = "NPR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionStatus status;

    @Column(length = 50)
    private String userId; // Who initiated the payment

    @Column(length = 100)
    private long merchantId; // If applicable

    @Column(length = 500)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String metadata; // JSON format for additional data

    @Column(columnDefinition = "TEXT")
    private String gatewayResponse; // Raw gateway response

    @Column(length = 500)
    private String failureReason;

    private String bookingId;

    private Integer retryCount = 0;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
    private LocalDateTime expiredAt;

    @Column(length = 45)
    private String ipAddress;

    @Column(length = 500)
    private String userAgent;

    @Column(length = 200)
    private String callbackUrl;

    @Column(length = 200)
    private String successUrl;

    @Column(length = 200)
    private String failureUrl;

    @Version
    private Long version; // Optimistic locking

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = TransactionStatus.INITIATED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (status == TransactionStatus.SUCCESS || status == TransactionStatus.FAILED) {
            completedAt = LocalDateTime.now();
        }
    }

}