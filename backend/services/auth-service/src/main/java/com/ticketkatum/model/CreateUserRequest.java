package com.ticketkatum.model;

import jakarta.annotation.Nullable;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String password;
    private String role;
    @Nullable
    private String organizationName;
}