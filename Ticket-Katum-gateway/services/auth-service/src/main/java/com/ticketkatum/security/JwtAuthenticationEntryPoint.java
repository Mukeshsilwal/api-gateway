package com.ticketkatum.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Custom JWT Authentication Entry Point
 * Handles unauthorized access attempts and formats error responses
 */
@Slf4j
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        log.warn("Unauthorized access attempt to: {} - Reason: {}",
                request.getRequestURI(), authException.getMessage());

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        // CORS headers - Consider moving to CorsConfiguration
        // Note: Allowing all origins (*) with credentials is a security risk
        String origin = request.getHeader("Origin");
        if (origin != null) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        }
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

        Map<String, Object> errorResponse = buildErrorResponse(request, authException);

        OBJECT_MAPPER.writeValue(response.getOutputStream(), errorResponse);
    }

    private Map<String, Object> buildErrorResponse(HttpServletRequest request,
                                                   AuthenticationException authException) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().format(FORMATTER));
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "Unauthorized");
        body.put("message", sanitizeMessage(authException.getMessage()));
        body.put("path", request.getRequestURI());

        return body;
    }

    /**
     * Sanitize error messages to prevent information leakage
     */
    private String sanitizeMessage(String message) {
        if (message == null || message.isEmpty()) {
            return "Authentication required";
        }
        // Don't expose internal error details
        return message.contains("JWT") || message.contains("token")
                ? "Invalid or expired token"
                : "Authentication failed";
    }
}