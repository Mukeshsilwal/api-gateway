package com.ticketkatum.entity;

import com.ticketkatum.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_registration_requests")
@Getter
@Setter
public class AdminRegistrationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private Long id;

    private String fullName;
    private String email;
    private String phone;

    private String citizenshipNumber;
    private String citizenshipFrontUrl;
    private String citizenshipBackUrl;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    private LocalDateTime createdAt;
}
