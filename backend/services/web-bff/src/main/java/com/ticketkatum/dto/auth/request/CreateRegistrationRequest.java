package com.ticketkatum.dto.auth.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRegistrationRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String organizationName;
    private String documentUrl;
}