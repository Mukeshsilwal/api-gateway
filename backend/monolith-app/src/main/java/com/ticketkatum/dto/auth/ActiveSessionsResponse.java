package com.ticketkatum.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveSessionsResponse {
    private String username;
    private List<Map<Object, Object>> sessions;
    private Long totalCount;


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionInfo {
        private String sessionId;
        private String ipAddress;
        private String userAgent;
        private LocalDateTime loginTime;
        private LocalDateTime lastActivity;
    }
}
