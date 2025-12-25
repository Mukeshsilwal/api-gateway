package com.ticketkatum.security;

import com.ticketkatum.entity.Role;
import com.ticketkatum.entity.Permission;
import com.ticketkatum.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.ticketkatum.common.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * JWT Token Service
 * Handles token generation, validation, and claims extraction using RS256
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService {

    private static final String AUTHORITIES_CLAIM = "authorities";
    private static final String PERMISSIONS_CLAIM = "permissions";
    private static final String ROLES_CLAIM = "roles";
    private static final String USER_ID_CLAIM = "userId";

    private final SystemConfigService systemConfigService;

    private SecretKey getSigningKey() {
        String jwtSecret = systemConfigService.getString("JWT_SECRET");
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            throw new IllegalStateException("JWT_SECRET not configured in System Config");
        }
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Extract username from JWT token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract expiration date from JWT token
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extract a specific claim from JWT token
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Validate JWT token against user details
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return username != null
                    && username.equals(userDetails.getUsername())
                    && !isTokenExpired(token)
                    && userDetails.isEnabled()
                    && userDetails.isAccountNonLocked()
                    && userDetails.isAccountNonExpired()
                    && userDetails.isCredentialsNonExpired();
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Generate access token for authenticated user
     */
    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        List<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getName)
                .distinct()
                .collect(Collectors.toList());

        claims.put(ROLES_CLAIM, roles);
        claims.put(PERMISSIONS_CLAIM, permissions);
        claims.put(USER_ID_CLAIM, user.getId());

        // Also add authorities for standard Spring Security compatibility
        claims.put(AUTHORITIES_CLAIM, user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        // Default 1h
        long expirationTime = systemConfigService.getLong("JWT_EXPIRATION_MS", 3600000L);
        return buildToken(claims, user.getUsername(), expirationTime);
    }

    /**
     * Generate refresh token for authenticated user
     */
    public String generateRefreshToken(UserDetails userDetails) {
        // Default 24h
        long refreshExpiration = systemConfigService.getLong("JWT_REFRESH_EXPIRATION_MS", 86400000L);
        return buildToken(new HashMap<>(), userDetails.getUsername(), refreshExpiration);
    }

    // Kept for backward compatibility if needed, but prefer
    // generateAccessToken(User)
    public String generateAccessToken(UserDetails userDetails) {
        if (userDetails instanceof User) {
            return generateAccessToken((User) userDetails);
        }
        // Fallback - extract roles from authorities
        Map<String, Object> claims = new HashMap<>();
        List<String> authorities = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        claims.put(AUTHORITIES_CLAIM, authorities);

        // Extract roles (authorities that start with ROLE_)
        List<String> roles = authorities.stream()
                .filter(auth -> auth.startsWith("ROLE_"))
                .collect(Collectors.toList());

        if (!roles.isEmpty()) {
            claims.put(ROLES_CLAIM, roles);
        }

        long expirationTime = systemConfigService.getLong("JWT_EXPIRATION_MS", 3600000L);
        return buildToken(claims, userDetails.getUsername(), expirationTime);
    }

    /**
     * Generate token with custom claims
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>(extraClaims);
        claims.put(AUTHORITIES_CLAIM, userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        long expirationTime = systemConfigService.getLong("JWT_EXPIRATION_MS", 3600000L);
        return buildToken(claims, userDetails.getUsername(), expirationTime);
    }

    /**
     * Build JWT token
     */
    private String buildToken(Map<String, Object> claims,
            String subject,
            long expirationTime) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .setIssuer("TicketKatum")
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract all claims from JWT token
     */
    @SuppressWarnings("deprecation")
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getSigningKey().getEncoded())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Check if token is expired
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Validate token format without full validation
     */
    public boolean isTokenFormatValid(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }

        // JWT should have 3 parts separated by dots
        String[] parts = token.split("\\.");
        return parts.length == 3;
    }
}