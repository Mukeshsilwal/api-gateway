package com.ticketkatum.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.service.UserSessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Session Validation Filter
 * Validates Redis-based user sessions and token binding
 * Executes before JWT authentication filter
 */
@Slf4j
@Component
@Order(1) // Execute before JwtAuthenticationFilter
@RequiredArgsConstructor
public class SessionValidationFilter extends OncePerRequestFilter {

    private final UserSessionService sessionService;

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private static final String SESSION_HEADER = "Session-Id";
    private static final String AUTH_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    /** Public endpoints that don't require session validation */
    private static final List<String> PUBLIC_URLS = Arrays.asList(
            "/auth/**",
            "/register/**",
            "/bookSeats/confirm",
            "/bookSeats/cancel",
            "/payment/**",
            "/api/v1/payment/**",
            "/actuator/health",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/error"
    );

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String path = request.getRequestURI();
        final String method = request.getMethod();

        // Skip validation for OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Skip validation for public URLs
        if (isPublicUrl(path)) {
            log.debug("Skipping session validation for public URL: {}", path);
            filterChain.doFilter(request, response);
            return;
        }

        final String sessionId = request.getHeader(SESSION_HEADER);
        final String authHeader = request.getHeader(AUTH_HEADER);

        // If session management is enabled, validate it
        if (sessionId != null && !sessionId.trim().isEmpty()) {
            if (!validateSession(sessionId, authHeader, request, response)) {
                return; // Response already sent
            }
        } else {
            log.debug("No session ID found for request: {}", path);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Check if the requested path is public
     */
    private boolean isPublicUrl(String path) {
        if (path == null || path.isEmpty()) {
            return false;
        }

        return PUBLIC_URLS.stream()
                .anyMatch(pattern -> PATH_MATCHER.match(pattern, path));
    }

    /**
     * Validate session and token binding
     * @return true if valid or no validation needed, false if invalid (response already sent)
     */
    private boolean validateSession(String sessionId,
                                    String authHeader,
                                    HttpServletRequest request,
                                    HttpServletResponse response) throws IOException {

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            log.warn("Session ID provided but no valid Authorization header for: {}",
                    request.getRequestURI());
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Authorization header is required with session");
            return false;
        }

        final String token = authHeader.substring(BEARER_PREFIX.length()).trim();

        if (token.isEmpty()) {
            log.warn("Empty token provided with session ID for: {}", request.getRequestURI());
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid authorization token");
            return false;
        }

        try {
            boolean isValid = sessionService.validateTokenWithSession(sessionId, token);

            if (!isValid) {
                log.warn("Invalid session or token mismatch. SessionId: {}, Path: {}",
                        sessionId, request.getRequestURI());
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED,
                        "Invalid or expired session");
                return false;
            }

            // Extend session on successful validation
            sessionService.extendSession(sessionId);
            log.debug("Session validated and extended: {}", sessionId);

            // Store session ID in request attribute for downstream use
            request.setAttribute("validatedSessionId", sessionId);

            return true;

        } catch (Exception ex) {
            log.error("Error validating session {}: {}", sessionId, ex.getMessage(), ex);
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Session validation error");
            return false;
        }
    }

    /**
     * Send JSON error response
     */
    private void sendErrorResponse(HttpServletResponse response,
                                   int status,
                                   String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> errorResponse = new LinkedHashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now().format(FORMATTER));
        errorResponse.put("status", status);
        errorResponse.put("error", getErrorName(status));
        errorResponse.put("message", message);

        OBJECT_MAPPER.writeValue(response.getOutputStream(), errorResponse);
    }

    /**
     * Get error name from HTTP status code
     */
    private String getErrorName(int status) {
        return switch (status) {
            case HttpServletResponse.SC_UNAUTHORIZED -> "Unauthorized";
            case HttpServletResponse.SC_FORBIDDEN -> "Forbidden";
            case HttpServletResponse.SC_INTERNAL_SERVER_ERROR -> "Internal Server Error";
            default -> "Error";
        };
    }

    /**
     * Determines if this filter should not run for this request
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Don't filter OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        // Don't filter public URLs
        return isPublicUrl(path);
    }
}