package com.ticketkatum.dto.auth.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpResponse {
    private boolean sent;
    private String message;
    private String otpReference;
    private LocalDateTime expiresAt;
}
