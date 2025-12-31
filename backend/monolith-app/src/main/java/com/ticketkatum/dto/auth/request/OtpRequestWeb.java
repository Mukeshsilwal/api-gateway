package com.ticketkatum.dto.auth.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpRequestWeb {

    @NotBlank(message = "Username/Email is required")
    @Email(message = "Email should be valid")
    private String username;
}
