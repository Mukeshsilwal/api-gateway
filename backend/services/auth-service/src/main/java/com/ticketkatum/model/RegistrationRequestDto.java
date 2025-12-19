package com.ticketkatum.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationRequestDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String organizationName;
    private String documentUrl;
    private String status;
    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;
}

