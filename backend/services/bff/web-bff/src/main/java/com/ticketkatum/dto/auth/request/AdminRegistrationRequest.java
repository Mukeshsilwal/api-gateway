package com.ticketkatum.dto.auth.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminRegistrationRequest {
    private String fullName;
    private String email;
    private String phone;
    private String hotelName;
    private String hotelAddress;
    private String panNumber;
    private String registrationCertificate;
    private Map<String, Object> documents;
}