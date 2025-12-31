package com.ticketkatum.modules.auth.api;

import com.ticketkatum.model.*;
import java.util.List;
import java.util.Map;

public interface AuthServiceApi {
    LoginResponse login(JwtRequest request, String ipAddress, String userAgent);
    LogoutResponse logout(String sessionId);
    Map<String, Object> logoutAllDevices(String username);
    Map<String, Object> validateSession(String sessionId, String token);
    Map<String, Object> getActiveSessions(String username);
    Long getOnlineUserCount();
    List<String> getOnlineUsers();
    UserDto registerUser(CreateUserRequest request);
    UserDto registerAdmin(CreateRegistrationRequest request);
    Map<String, Object> processOAuth2Login(Map<String, Object> request);
    Map<String, Object> refreshToken(String refreshToken, String sessionId);
}
