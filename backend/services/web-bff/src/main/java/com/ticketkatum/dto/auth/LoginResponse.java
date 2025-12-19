package com.ticketkatum.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String sessionId;
    private String username;
    private List<String> roles;
    private Long activeSessionCount;
    private String tokenType; //
}
