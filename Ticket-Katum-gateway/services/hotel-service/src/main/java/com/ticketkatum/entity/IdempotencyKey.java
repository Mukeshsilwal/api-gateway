package com.ticketkatum.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "idempotency_key", uniqueConstraints = @UniqueConstraint(columnNames = "key_value"))
public class IdempotencyKey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "key_value", nullable = false, unique = true)
    private String key;

    @Column(name = "result_payload", columnDefinition = "text")
    private String resultPayload;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
}
