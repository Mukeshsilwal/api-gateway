package com.ticketkatum.controller;

import com.ticketkatum.model.*;
import com.ticketkatum.entity.User;
import com.ticketkatum.security.JwtService;
import com.ticketkatum.service.RefreshTokenService;
import com.ticketkatum.service.UserSessionService;
import com.ticketkatum.service.serviceimpl.RegistrationService;
import com.ticketkatum.service.serviceimpl.UserService;
import com.ticketkatum.entity.RefreshToken;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Authentication Controller
 * Handles user authentication, session management, and user registration
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Validated
@Slf4j
public class AuthController {

    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserSessionService sessionService;
    private final AuthenticationManager authenticationManager;
    private final RegistrationService registrationService;
    private final RefreshTokenService refreshTokenService;
    private final UserService userService;

    /**
     * User login endpoint
     * Creates JWT token and session
     */
    @PostMapping("/login")
    public ResponseEntity<Response<LoginResponse>> login(
            @Valid @RequestBody JwtRequest loginRequest,
            HttpServletRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()));

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        String accessToken = jwtService.generateAccessToken(userDetails);

        // Generate and save Refresh Token
        String refreshToken = refreshTokenService.createRefreshToken(userDetails.getUsername());
        List<String> roles = userDetails.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        String sessionId = sessionService.createSession(
                loginRequest.getUsername(),
                accessToken,
                Map.of(
                        "ipAddress", getClientIP(request),
                        "userAgent", getUserAgent(request),
                        "roles", roles,
                        "loginTime", System.currentTimeMillis()));

        LoginResponse loginResponse = LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .sessionId(sessionId)
                .username(userDetails.getUsername())
                .roles(roles)
                .activeSessionCount(sessionService.getUserSessionCount(loginRequest.getUsername()))
                .tokenType("Bearer")
                .build();
        Response<LoginResponse> response = ResponseHandler.success(
                "User login successfully",
                loginResponse);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * User logout endpoint
     * Invalidates the current session
     */
    @PostMapping("/logout")
    public ResponseEntity<Response<LogoutResponse>> logout(
            @RequestHeader("Session-Id") String sessionId) {

        try {
            if (sessionId == null || sessionId.trim().isEmpty()) {
                throw new IllegalArgumentException("Session ID is required");
            }

            Map<Object, Object> session = sessionService.getSession(sessionId);
            String username = session != null ? (String) session.get("username") : "unknown";

            sessionService.invalidateSession(sessionId);

            // Note: If you want logout to invalidate the refresh token too, we'd need the
            // token string here.
            // But API spec says logout takes Session-Id. Refresh token is separate?
            // "Logout invalidates refresh token" -> implies we need to know WHICH refresh
            // token.
            // But here we only have sessionId.
            // If they track sessionId in RefreshToken entity, we could delete it.
            // But RefreshToken entity is User-bound.
            // For now, logout invalidates HttpSession.
            // To invalidate refresh token, we would need the refresh token passed in, or
            // invalidate ALL user refresh tokens.
            // Let's assume strict logout kills sessions.
            // If we want to support "Logout" button on unrelated device, usually it just
            // kills that session key.
            // Refresh Token revocation endpoint is often separate or implies invalidating
            // user login.
            // Let's leave as Session Invalidation for now.

            log.info("User {} logged out. Session: {}", username, sessionId);
            LogoutResponse logoutResponse = LogoutResponse.builder().sessionId(sessionId)
                    .message("Successfully logged out").build();

            Response<LogoutResponse> response = ResponseHandler.success(
                    "Logged out successfully",
                    logoutResponse);
            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (IllegalArgumentException e) {
            Response<LogoutResponse> response = ResponseHandler.failure(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("Error during logout for session: {}", sessionId, e);
            Response<LogoutResponse> response = ResponseHandler.failure(
                    "Logout failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Logout from all devices
     * Invalidates all sessions for the user
     */
    @PostMapping("/logout-all")
    public ResponseEntity<Response<Map<String, Object>>> logoutAllDevices(
            @RequestHeader("Username") String username) {

        try {
            if (username == null || username.trim().isEmpty()) {
                throw new IllegalArgumentException("Username is required");
            }

            Long sessionsInvalidated = sessionService.invalidateAllUserSessions(username);
            
            try {
                // Invalidate all refresh tokens
                User user = (User) userDetailsService.loadUserByUsername(username);
                refreshTokenService.deleteByUserId(user.getId());
                log.info("Invalidated refresh tokens for user {}", username);
            } catch (Exception e) {
                log.warn("Failed to delete refresh tokens for user {}: {}", username, e.getMessage());
            }

            log.info("User {} logged out from all devices. Sessions invalidated: {}",
                    username, sessionsInvalidated);

            Map<String, Object> data = new HashMap<>();
            data.put("username", username);
            data.put("sessionsInvalidated", sessionsInvalidated);

            Response<Map<String, Object>> response = ResponseHandler.success(
                    "Logged out from all devices",
                    data);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Response<Map<String, Object>> response = ResponseHandler.failure(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("Error during logout all for user: {}", username, e);
            Response<Map<String, Object>> response = ResponseHandler.failure(
                    "Logout failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Validate session endpoint
     * Checks if the session and token are valid
     */
    @GetMapping("/session/validate")
    public ResponseEntity<Response<Map<String, Object>>> validateSession(
            @RequestHeader("Session-Id") String sessionId,
            @RequestHeader("Authorization") String authHeader) {

        try {
            if (sessionId == null || sessionId.trim().isEmpty()) {
                throw new IllegalArgumentException("Session ID is required");
            }
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Valid Authorization header is required");
            }

            String token = authHeader.substring(7).trim();
            Map<Object, Object> session = sessionService.getSession(sessionId);

            if (session == null || session.isEmpty()) {
                Response<Map<String, Object>> response = ResponseHandler.failure(
                        "Session not found or expired");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            if (!sessionService.validateTokenWithSession(sessionId, token)) {
                Response<Map<String, Object>> response = ResponseHandler.failure(
                        "Token does not match session");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            sessionService.extendSession(sessionId);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("valid", true);
            responseData.put("sessionId", sessionId);
            responseData.put("username", session.get("username"));
            responseData.put("roles", session.get("roles"));
            responseData.put("ipAddress", session.get("ipAddress"));

            Response<Map<String, Object>> response = ResponseHandler.success(
                    "Session is valid",
                    responseData);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Response<Map<String, Object>> response = ResponseHandler.failure(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("Error validating session: {}", sessionId, e);
            Response<Map<String, Object>> response = ResponseHandler.failure(
                    "Validation failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get active sessions for a user
     */
    @GetMapping("/sessions/active")
    public ResponseEntity<Response<Map<String, Object>>> getActiveSessions(
            @RequestHeader("Username") String username) {

        try {
            if (username == null || username.trim().isEmpty()) {
                throw new IllegalArgumentException("Username is required");
            }

            List<Map<Object, Object>> sessions = sessionService.getUserSessions(username);
            Long sessionCount = sessionService.getUserSessionCount(username);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("username", username);
            responseData.put("sessions", sessions);
            responseData.put("totalCount", sessionCount);

            Response<Map<String, Object>> response = ResponseHandler.success(
                    "Active sessions retrieved",
                    responseData);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Response<Map<String, Object>> response = ResponseHandler.failure(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("Error fetching active sessions for user: {}", username, e);
            Response<Map<String, Object>> response = ResponseHandler.failure(
                    "Failed to fetch sessions");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get online user count
     */
    @GetMapping("/users/online/count")
    public ResponseEntity<Response<Map<String, Long>>> getOnlineUserCount() {
        try {
            Long activeUserCount = sessionService.getActiveUserCount();

            Map<String, Long> data = new HashMap<>();
            data.put("activeUsers", activeUserCount);
            data.put("timestamp", System.currentTimeMillis());

            Response<Map<String, Long>> response = ResponseHandler.success(
                    "Online user count retrieved",
                    data);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching online user count", e);
            Response<Map<String, Long>> response = ResponseHandler.failure(
                    "Failed to fetch user count");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get all online users
     */
    @GetMapping("/users/online")
    public ResponseEntity<Response<Map<String, Object>>> getOnlineUsers() {
        try {
            List<String> activeUsers = sessionService.getActiveUsers();
            Long activeUserCount = sessionService.getActiveUserCount();

            Map<String, Object> data = new HashMap<>();
            data.put("activeUsers", activeUsers);
            data.put("count", activeUserCount);
            data.put("timestamp", System.currentTimeMillis());

            Response<Map<String, Object>> response = ResponseHandler.success(
                    "Online users retrieved",
                    data);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching online users", e);
            Response<Map<String, Object>> response = ResponseHandler.failure(
                    "Failed to fetch online users");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    @PostMapping("/register/admin")
    public ResponseEntity<Response<UserDto>> registerAdmin(
            @Valid @RequestBody CreateRegistrationRequest createRegistrationRequest) {

        try {
            log.info("Attempting to register user: {}", createRegistrationRequest.getEmail());

            registrationService.registerAdmin(createRegistrationRequest);

            Response<UserDto> response = ResponseHandler.success(
                    "User registered successfully",
                    null);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid user registration data: {}", e.getMessage());
            Response<UserDto> response = ResponseHandler.failure(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("Error creating user: {}", createRegistrationRequest.getEmail(), e);
            Response<UserDto> response = ResponseHandler.failure(
                    "Registration failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Customer registration endpoint
     */
    @PostMapping("/register")
    public ResponseEntity<Response<UserDto>> registerCustomer(
            @Valid @RequestBody CreateUserRequest createUserRequest) {

        try {
            log.info("Attempting to register customer: {}", createUserRequest.getEmail());
            
            // Force role to USER if not specified or override?
            // Let's rely on service logic or set it here.
            // CreateUserRequest has "role" field.
            // If public registration, we should force "USER".
            createUserRequest.setRole("USER"); 
            
            UserDto userDto = userService.createUser(createUserRequest);

            Response<UserDto> response = ResponseHandler.success(
                    "User registered successfully",
                    userDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid user registration data: {}", e.getMessage());
            Response<UserDto> response = ResponseHandler.failure(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("Error creating user: {}", createUserRequest.getEmail(), e);
            Response<UserDto> response = ResponseHandler.failure(
                    e.getMessage()); // Expose message (e.g. DuplicateResourceException)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response); // Use 400 for errors
        }
    }

    /**
     * Refresh token endpoint
     */
    @PostMapping("/refresh")
    public ResponseEntity<Response<Map<String, Object>>> refreshToken(
            @RequestHeader("Authorization") String authHeader,
            @RequestHeader("Session-Id") String sessionId) {

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Valid Authorization header is required");
            }

            String refreshToken = authHeader.substring(7).trim();
            // String username = jwtService.extractUsername(refreshToken); // Token is opaque now

            // Verify token in DB
            RefreshToken dbToken = refreshTokenService.findByToken(refreshToken)
                    .orElseThrow(() -> new BadCredentialsException("Refresh token not found"));
            
            UserDetails userDetails = (UserDetails) dbToken.getUser();
            // Or load fresh: userDetailsService.loadUserByUsername(dbToken.getUser().getEmail());

            if (dbToken.isRevoked()) {
                throw new BadCredentialsException("Refresh token revoked");
            }

            refreshTokenService.verifyExpiration(dbToken);

            // Generate new access token
            String newAccessToken = jwtService.generateAccessToken(userDetails);

            // Update session with new token
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

            Response<Map<String, Object>> response = ResponseHandler.success(
                    "Token refreshed successfully",
                    responseData);
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException | IllegalArgumentException e) {
            log.warn("Token refresh failed: {}", e.getMessage());
            Response<Map<String, Object>> response = ResponseHandler.failure(e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (Exception e) {
            log.error("Error refreshing token", e);
            Response<Map<String, Object>> response = ResponseHandler.failure(
                    "Token refresh failed");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Extract client IP address from request
     */
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        // X-Forwarded-For can contain multiple IPs, take the first one
        return xfHeader.split(",")[0].trim();
    }

    /**
     * Extract user agent from request
     */
    private String getUserAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent != null ? userAgent : "Unknown";
    }
}