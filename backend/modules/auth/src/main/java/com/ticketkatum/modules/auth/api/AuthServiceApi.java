package com.ticketkatum.modules.auth.api;

import com.ticketkatum.model.*;

import java.util.List;
import java.util.Map;

public interface AuthServiceApi {
    LoginResponse login(JwtRequest request, String ipAddress, String userAgent);

    LogoutResponse logout(String sessionId);

    Map<String, Object> logoutAllDevices(String username); // Keeping as Map as mostly void/status or simple map

    SessionValidationResponse validateSession(String sessionId, String token);

    ActiveSessionsResponse getActiveSessions(String username);

    Long getOnlineUserCount();

    List<String> getOnlineUsers();

    UserDto registerUser(CreateUserRequest request);

    LoginResponse processOAuth2Login(Map<String, Object> request);

    Map<String, Object> refreshToken(String refreshToken, String sessionId);
}
