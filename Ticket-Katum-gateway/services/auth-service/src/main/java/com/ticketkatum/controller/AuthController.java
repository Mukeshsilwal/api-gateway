package com.ticketkatum.controller;

import com.ticketkatum.model.JwtRequest;
import com.ticketkatum.model.UserDto;
import com.ticketkatum.security.JwtService;
import com.ticketkatum.service.UserService;
import com.ticketkatum.service.UserSessionService;
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
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    private final UserService userService;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserSessionService sessionService;
    private final AuthenticationManager authenticationManager;

    /**
     * User login endpoint
     * Creates JWT token and session
     */
    @PostMapping("/login")
    public ResponseEntity<Response<Map<String, Object>>> login(
            @Valid @RequestBody JwtRequest loginRequest,
            HttpServletRequest request) {

        try {
            // Validate input
            if (loginRequest.getUsername() == null || loginRequest.getUsername().trim().isEmpty()) {
                throw new IllegalArgumentException("Username cannot be empty");
            }
            if (loginRequest.getPassword() == null || loginRequest.getPassword().isEmpty()) {
                throw new IllegalArgumentException("Password cannot be empty");
            }

            log.info("Login attempt for user: {}", loginRequest.getUsername());

            // Authenticate using Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Generate JWT token
            String accessToken = jwtService.generateAccessToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            // Extract roles
            List<String> roles = userDetails.getAuthorities()
                    .stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            // Prepare session data
            Map<String, Object> sessionData = new HashMap<>();
            sessionData.put("ipAddress", getClientIP(request));
            sessionData.put("userAgent", getUserAgent(request));
            sessionData.put("roles", roles);
            sessionData.put("loginTime", System.currentTimeMillis());

            // Create session in Redis
            String sessionId = sessionService.createSession(
                    loginRequest.getUsername(),
                    accessToken,
                    sessionData
            );

            // Get active session count
            Long sessionCount = sessionService.getUserSessionCount(loginRequest.getUsername());

            // Prepare response
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("accessToken", accessToken);
            responseData.put("refreshToken", refreshToken);
            responseData.put("sessionId", sessionId);
            responseData.put("username", userDetails.getUsername());
            responseData.put("roles", roles);
            responseData.put("activeSessionCount", sessionCount);
            responseData.put("tokenType", "Bearer");

            log.info("User {} logged in successfully. Active sessions: {}",
                    loginRequest.getUsername(), sessionCount);

            Response<Map<String, Object>> response = ResponseHandler.success(
                    "Login successful",
                    responseData
            );
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            log.warn("Invalid credentials for user: {}", loginRequest.getUsername());
            Response<Map<String, Object>> response = ResponseHandler.failure(
                    "Invalid username or password"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (DisabledException e) {
            log.warn("Disabled account login attempt: {}", loginRequest.getUsername());
            Response<Map<String, Object>> response = ResponseHandler.failure(
                    "Account is disabled. Please contact support."
            );
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);

        } catch (UsernameNotFoundException e) {
            log.warn("User not found: {}", loginRequest.getUsername());
            Response<Map<String, Object>> response = ResponseHandler.failure(
                    "Invalid username or password"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid login request: {}", e.getMessage());
            Response<Map<String, Object>> response = ResponseHandler.failure(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("Unexpected error during login for user: {}",
                    loginRequest.getUsername(), e);
            Response<Map<String, Object>> response = ResponseHandler.failure(
                    "Login failed. Please try again later."
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * User logout endpoint
     * Invalidates the current session
     */
    @PostMapping("/logout")
    public ResponseEntity<Response<Map<String, Object>>> logout(
            @RequestHeader("Session-Id") String sessionId) {

        try {
            if (sessionId == null || sessionId.trim().isEmpty()) {
                throw new IllegalArgumentException("Session ID is required");
            }

            Map<Object, Object> session = sessionService.getSession(sessionId);
            String username = session != null ? (String) session.get("username") : "unknown";

            sessionService.invalidateSession(sessionId);

            log.info("User {} logged out. Session: {}", username, sessionId);

            Map<String, Object> data = new HashMap<>();
            data.put("sessionId", sessionId);
            data.put("message", "Successfully logged out");

            Response<Map<String, Object>> response = ResponseHandler.success(
                    "Logged out successfully",
                    data
            );
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Response<Map<String, Object>> response = ResponseHandler.failure(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("Error during logout for session: {}", sessionId, e);
            Response<Map<String, Object>> response = ResponseHandler.failure(
                    "Logout failed. Please try again."
            );
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

            log.info("User {} logged out from all devices. Sessions invalidated: {}",
                    username, sessionsInvalidated);

            Map<String, Object> data = new HashMap<>();
            data.put("username", username);
            data.put("sessionsInvalidated", sessionsInvalidated);

            Response<Map<String, Object>> response = ResponseHandler.success(
                    "Logged out from all devices",
                    data
            );
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Response<Map<String, Object>> response = ResponseHandler.failure(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("Error during logout all for user: {}", username, e);
            Response<Map<String, Object>> response = ResponseHandler.failure(
                    "Logout failed. Please try again."
            );
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
                        "Session not found or expired"
                );
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            if (!sessionService.validateTokenWithSession(sessionId, token)) {
                Response<Map<String, Object>> response = ResponseHandler.failure(
                        "Token does not match session"
                );
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Extend session on successful validation
            sessionService.extendSession(sessionId);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("valid", true);
            responseData.put("sessionId", sessionId);
            responseData.put("username", session.get("username"));
            responseData.put("roles", session.get("roles"));
            responseData.put("ipAddress", session.get("ipAddress"));

            Response<Map<String, Object>> response = ResponseHandler.success(
                    "Session is valid",
                    responseData
            );
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Response<Map<String, Object>> response = ResponseHandler.failure(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("Error validating session: {}", sessionId, e);
            Response<Map<String, Object>> response = ResponseHandler.failure(
                    "Validation failed. Please try again."
            );
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
                    responseData
            );
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Response<Map<String, Object>> response = ResponseHandler.failure(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("Error fetching active sessions for user: {}", username, e);
            Response<Map<String, Object>> response = ResponseHandler.failure(
                    "Failed to fetch sessions"
            );
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
                    data
            );
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching online user count", e);
            Response<Map<String, Long>> response = ResponseHandler.failure(
                    "Failed to fetch user count"
            );
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
                    data
            );
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching online users", e);
            Response<Map<String, Object>> response = ResponseHandler.failure(
                    "Failed to fetch online users"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * User registration endpoint
     */
    @PostMapping("/register")
    public ResponseEntity<Response<UserDto>> registerUser(
            @Valid @RequestBody UserDto userDto) {

        try {
            log.info("Attempting to register user: {}", userDto.getFullName());

            UserDto savedUser = userService.createUser(userDto);

            log.info("User registered successfully: {}", savedUser.getFullName());

            Response<UserDto> response = ResponseHandler.success(
                    "User registered successfully",
                    savedUser
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid user registration data: {}", e.getMessage());
            Response<UserDto> response = ResponseHandler.failure(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("Error creating user: {}", userDto.getUsername(), e);
            Response<UserDto> response = ResponseHandler.failure(
                    "Registration failed. Please try again."
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
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
            String username = jwtService.extractUsername(refreshToken);

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtService.isTokenValid(refreshToken, userDetails)) {
                throw new BadCredentialsException("Invalid or expired refresh token");
            }

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
                    responseData
            );
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException | IllegalArgumentException e) {
            log.warn("Token refresh failed: {}", e.getMessage());
            Response<Map<String, Object>> response = ResponseHandler.failure(e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (Exception e) {
            log.error("Error refreshing token", e);
            Response<Map<String, Object>> response = ResponseHandler.failure(
                    "Token refresh failed"
            );
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