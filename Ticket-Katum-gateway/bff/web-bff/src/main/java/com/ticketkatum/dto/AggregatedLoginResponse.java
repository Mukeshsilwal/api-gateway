package com.ticketkatum.dto;

import com.ticketkatum.dto.auth.response.LoginResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AggregatedLoginResponse {
    private LoginResponse authData;
    private UserDto userProfile;
    private List<String> recentBookings;
    private Map<String, Object> userPreferences;
    private Long onlineUserCount;
}
