package com.ticketkatum.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionValidationResponse {
    private boolean valid;
    private String sessionId;
    private String username;
    private List<String> roles;
    private String ipAddress;
}
