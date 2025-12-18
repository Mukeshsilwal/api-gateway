package com.ticketkatum.security;

import com.ticketkatum.entity.Role;
import com.ticketkatum.entity.Permission;
import com.ticketkatum.entity.User;
import io.jsonwebtoken.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
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
public class JwtService {

    private static final String AUTHORITIES_CLAIM = "authorities";
    private static final String PERMISSIONS_CLAIM = "permissions";
    private static final String ROLES_CLAIM = "roles";
    private static final String USER_ID_CLAIM = "userId";

    @Value("${jwt.expiration.time:3600000}")
    private long jwtExpirationTime;

    @Value("${jwt.refresh.expiration.time:86400000}")
    private long refreshExpirationTime;

    private final PrivateKey privateKey;
    private final PublicKey publicKey;

    public JwtService() {
        // Generate RSA Key Pair on startup (In production, load from Keystore/Vault)
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            KeyPair keyPair = keyPairGenerator.generateKeyPair();
            this.privateKey = keyPair.getPrivate();
            this.publicKey = keyPair.getPublic();
            log.info("RSA Key Pair generated successfully");
        } catch (NoSuchAlgorithmException e) {
            log.error("Failed to generate RSA keys", e);
            throw new RuntimeException(e);
        }
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

        return buildToken(claims, user.getUsername(), jwtExpirationTime);
    }

    /**
     * Generate refresh token for authenticated user
     */
    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails.getUsername(), refreshExpirationTime);
    }

    // Kept for backward compatibility if needed, but prefer
    // generateAccessToken(User)
    public String generateAccessToken(UserDetails userDetails) {
        if (userDetails instanceof User) {
            return generateAccessToken((User) userDetails);
        }
        // Fallback or empty claims
        Map<String, Object> claims = new HashMap<>();
        claims.put(AUTHORITIES_CLAIM, userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        return buildToken(claims, userDetails.getUsername(), jwtExpirationTime);
    }

    /**
     * Generate token with custom claims
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>(extraClaims);
        claims.put(AUTHORITIES_CLAIM, userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        return buildToken(claims, userDetails.getUsername(), jwtExpirationTime);
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
                .signWith(privateKey, SignatureAlgorithm.RS256)
                .compact();
    }

    /**
     * Extract all claims from JWT token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(publicKey)
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