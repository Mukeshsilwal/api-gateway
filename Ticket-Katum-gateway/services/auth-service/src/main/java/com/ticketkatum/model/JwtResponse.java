package com.ticketkatum.model;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JwtResponse {
    private String token;
    private List<String> roles;
    private String sessionId;
    private long activeSessionCount;
}
