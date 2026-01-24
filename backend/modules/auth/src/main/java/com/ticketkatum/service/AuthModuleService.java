package com.ticketkatum.service;

import com.ticketkatum.entity.User;
import com.ticketkatum.entity.RefreshToken;
import com.ticketkatum.model.*;
import com.ticketkatum.modules.auth.api.AuthServiceApi;
import com.ticketkatum.security.JwtService;
import com.ticketkatum.service.RefreshTokenService;
import com.ticketkatum.service.UserSessionService;
import com.ticketkatum.service.serviceimpl.RegistrationService;
import com.ticketkatum.service.serviceimpl.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthModuleService implements AuthServiceApi {

    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserSessionService sessionService;
    private final AuthenticationManager authenticationManager;
    private final RegistrationService registrationService;
    private final RefreshTokenService refreshTokenService;
    private final UserService userService;

    @Override
    public LoginResponse login(JwtRequest loginRequest, String ipAddress, String userAgent) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()));

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = refreshTokenService.createRefreshToken(userDetails.getUsername());
        List<String> roles = userDetails.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        String sessionId = sessionService.createSession(
                userDetails.getUsername(),
                accessToken,
                Map.of(
                        "ipAddress", ipAddress != null ? ipAddress : "unknown",
                        "userAgent", userAgent != null ? userAgent : "unknown",
                        "roles", roles,
                        "loginTime", System.currentTimeMillis()));

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .sessionId(sessionId)
                .username(userDetails.getUsername())
                .roles(roles)
                .activeSessionCount(sessionService.getUserSessionCount(userDetails.getUsername()))
                .tokenType("Bearer")
                .build();
    }

    @Override
    public LogoutResponse logout(String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            throw new IllegalArgumentException("Session ID is required");
        }

        Map<Object, Object> session = sessionService.getSession(sessionId);
        String username = session != null ? (String) session.get("user") : "unknown";

        sessionService.invalidateSession(sessionId);
        log.info("User {} logged out. Session: {}", username, sessionId);

        return LogoutResponse.builder()
                .sessionId(sessionId)
                .message("Successfully logged out")
                .build();
    }

    @Override
    public Map<String, Object> logoutAllDevices(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required");
        }

        Long sessionsInvalidated = sessionService.invalidateAllUserSessions(username);

        try {
            User user = (User) userDetailsService.loadUserByUsername(username);
            refreshTokenService.deleteByUserId(user.getId());
            log.info("Invalidated refresh tokens for user {}", username);
        } catch (Exception e) {
            log.warn("Failed to delete refresh tokens for user {}: {}", username, e.getMessage());
        }

        log.info("User {} logged out from all devices. Sessions invalidated: {}", username, sessionsInvalidated);

        Map<String, Object> data = new HashMap<>();
        data.put("username", username);
        data.put("sessionsInvalidated", sessionsInvalidated);
        return data;
    }

    @Override
    public SessionValidationResponse validateSession(String sessionId, String token) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            throw new IllegalArgumentException("Session ID is required");
        }
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Valid token is required");
        }

        Map<Object, Object> session = sessionService.getSession(sessionId);

        if (session == null || session.isEmpty()) {
            throw new RuntimeException("Session not found or expired");
        }

        if (!sessionService.validateTokenWithSession(sessionId, token)) {
            throw new RuntimeException("Token does not match session");
        }

        sessionService.extendSession(sessionId);

        return SessionValidationResponse.builder()
                .valid(true)
                .sessionId(sessionId)
                .username((String) session.get("username"))
                .roles((List<String>) session.get("roles"))
                .ipAddress((String) session.get("ipAddress"))
                .build();
    }

    @Override
    public ActiveSessionsResponse getActiveSessions(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required");
        }

        List<Map<Object, Object>> sessions = sessionService.getUserSessions(username);
        Long sessionCount = sessionService.getUserSessionCount(username);

        return ActiveSessionsResponse.builder()
                .username(username)
                .sessions(sessions)
                .totalCount(sessionCount)
                .build();
    }

    @Override
    public Long getOnlineUserCount() {
        return sessionService.getActiveUserCount();
    }

    @Override
    public List<String> getOnlineUsers() {
        return sessionService.getActiveUsers();
    }

    @Override
    public UserDto registerUser(CreateUserRequest request) {
        log.info("Attempting to register customer: {}", request.getEmail());
        request.setRole("USER"); // Force role
        return userService.createUser(request);
    }

    @Override
    public UserDto registerAdmin(CreateRegistrationRequest request) {
         log.info("Attempting to register admin: {}", request.getEmail());
         // RegistrationService handles logic but returns void in Controller?
         // Controller calls registrationService.registerAdmin(request) then returns null data.
         // Wait, Controller returns UserDto as null in Response.
         // Let's modify to return UserDto if possible or null.
         registrationService.registerAdmin(request);
         return null; 
    }

    @Override
    public LoginResponse processOAuth2Login(Map<String, Object> oauth2Request) {
        String email = (String) oauth2Request.get("email");
        String name = (String) oauth2Request.get("name");
        String provider = (String) oauth2Request.get("provider");
        String ipAddress = (String) oauth2Request.get("ipAddress");
        String userAgent = (String) oauth2Request.get("userAgent");

        log.info("Processing OAuth2 login for email: {} via provider: {}", email, provider);

        User user;
        try {
            user = (User) userDetailsService.loadUserByUsername(email);
            if (!provider.equals(user.getProvider())) {
                user.setProvider(provider);
                userService.updateUserProvider(user.getId(), provider);
            }
        } catch (Exception e) {
            CreateUserRequest createUserRequest = new CreateUserRequest();
            createUserRequest.setEmail(email);
            createUserRequest.setFirstName(name != null ? name.split(" ")[0] : "");
            createUserRequest.setLastName(name != null && name.split(" ").length > 1 ? name.split(" ")[1] : "");
            createUserRequest.setRole("USER");
            createUserRequest.setPassword(null);
            
            // userService.createOAuth2User returns UserDto, not User entity.
            // But we need User entity/properties for token generation.
            // The Controller re-loaded user details after creation.
            UserDto userDto = userService.createOAuth2User(createUserRequest);
            user = (User) userDetailsService.loadUserByUsername(email);
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user.getEmail());

        List<String> roles = user.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        String sessionId = sessionService.createSession(
                user.getEmail(),
                accessToken,
                Map.of(
                        "ipAddress", ipAddress != null ? ipAddress : "unknown",
                        "userAgent", userAgent != null ? userAgent : "unknown",
                        "roles", roles,
                        "loginTime", System.currentTimeMillis(),
                        "provider", provider));

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .sessionId(sessionId)
                .username(user.getEmail())
                .roles(roles)
                .activeSessionCount(sessionService.getUserSessionCount(user.getEmail())) // Add this if needed
                .tokenType("Bearer")
                .provider(provider)
                .build();
    }

    @Override
    public Map<String, Object> refreshToken(String refreshToken, String sessionId) {
        RefreshToken dbToken = refreshTokenService.findByToken(refreshToken)
                .orElseThrow(() -> new BadCredentialsException("Refresh token not found"));

        UserDetails userDetails = (UserDetails) dbToken.getUser();

        if (dbToken.isRevoked()) {
            throw new BadCredentialsException("Refresh token revoked");
        }

        refreshTokenService.verifyExpiration(dbToken);

        String newAccessToken = jwtService.generateAccessToken(userDetails);

        Map<Object, Object> session = sessionService.getSession(sessionId);
        if (session != null && !session.isEmpty()) {
            Map<String, Object> updatedData = new HashMap<>();
            updatedData.put("token", newAccessToken);
            updatedData.put("lastRefresh", System.currentTimeMillis());
            sessionService.updateSession(sessionId, updatedData);
        }

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("accessToken", newAccessToken);
        responseData.put("tokenType", "Bearer");
        return responseData;
    }
}
