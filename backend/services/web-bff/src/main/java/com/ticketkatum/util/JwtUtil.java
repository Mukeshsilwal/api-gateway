package com.ticketkatum.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * Utility class for extracting user information from JWT tokens
 */
@Component
@Slf4j
public class JwtUtil {

    @Value("${security.jwt.secret}")
    private String jwtSecret;

    /**
     * Extract user ID from JWT token in Authorization header
     */
    public Long extractUserIdFromToken(String token) {
        try {
            if (token == null || token.isEmpty()) {
                log.warn("Token is null or empty");
                return null;
            }

            // Remove "Bearer " prefix if present
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            SecretKey key = io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                    jwtSecret.getBytes(StandardCharsets.UTF_8));

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Extract userId from claims
            Object userIdObj = claims.get("userId");
            if (userIdObj != null) {
                if (userIdObj instanceof Integer) {
                    return ((Integer) userIdObj).longValue();
                } else if (userIdObj instanceof Long) {
                    return (Long) userIdObj;
                } else if (userIdObj instanceof String) {
                    return Long.parseLong((String) userIdObj);
                }
            }

            log.warn("userId claim not found in token");
            return null;
        } catch (Exception e) {
            log.error("Failed to extract userId from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extract user ID from Spring Security Authentication object
     */
    public Long extractUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is null or not authenticated");
            return null;
        }

        // The principal is the username (email)
        // We need to get userId from somewhere else
        // For now, return null - this should be enhanced
        log.debug("Authenticated user: {}", authentication.getName());
        return null;
    }

    /**
     * Extract username from JWT token
     */
    public String extractUsername(String token) {
        try {
            if (token == null || token.isEmpty()) {
                return null;
            }

            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            SecretKey key = io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                    jwtSecret.getBytes(StandardCharsets.UTF_8));

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.getSubject();
        } catch (Exception e) {
            log.error("Failed to extract username from token: {}", e.getMessage());
            return null;
        }
    }
}
