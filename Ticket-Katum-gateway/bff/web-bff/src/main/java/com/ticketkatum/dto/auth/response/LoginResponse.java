package com.ticketkatum.dto.auth.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String sessionId;
    public String username;
    private List<String> roles;
    private Long activeSessionCount;
    private String tokenType;
}

