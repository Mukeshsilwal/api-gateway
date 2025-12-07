package com.ticketkatum.dto.auth;

import com.ticketkatum.dto.AggregatedUserDashboard;

import java.util.List;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class UserActivitySummary {
    private String username;
    private boolean isOnline;
    private Long activeSessionCount;
    private List<AggregatedUserDashboard> sessions;
    private java.time.LocalDateTime lastActivity;
}
