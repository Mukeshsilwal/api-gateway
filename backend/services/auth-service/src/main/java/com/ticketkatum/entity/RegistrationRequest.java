package com.ticketkatum.entity;

import com.ticketkatum.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "registration_requests", indexes = {
        @Index(name = "idx_email_status", columnList = "email,status"),
        @Index(name = "idx_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 20)
    private String phoneNumber;

    @Column(length = 100)
    private String organizationName;

    @Column(length = 500)
    private String documentUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime requestedAt;

    private LocalDateTime approvedAt;

    @PrePersist
    protected void onCreate() {
        requestedAt = LocalDateTime.now();
    }
}

