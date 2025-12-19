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
public class AdminRegistrationResponse {
    private Long requestId;
    private String status;
    private String message;
    private LocalDateTime submittedAt;
}
