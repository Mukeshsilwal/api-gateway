package com.ticketkatum.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * JWT Authentication Filter
 * Validates JWT tokens and establishes Spring Security context
 * Uses jakarta.servlet for Spring Boot 3.x compatibility
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String AUTH_HEADER = "Authorization";

    /** Public endpoints that don't require authentication */
    private static final List<String> PUBLIC_URLS = Arrays.asList(
            "/auth/**",
            "/register/**",
            "/bookSeats/confirm",
            "/bookSeats/cancel",
            "/corn/**",
            "/secret/**",
            "/payment/**",
            "/tickets/**",
            "/busStop/**",
            "/route/**",
            "/bus/**",
            "/seat/**",
            "/booking/**",
            "/api/booking/**",
            "/api/qfx/**",
            "/mock/qfx/api/**",
            "/api/v1/payment/**",
            "/api/v1/find/**",
            "/api/v1/hotels/**",
            "/actuator/health",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/error",
            "/api/users/**"
    );

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String path = request.getRequestURI();
        final String method = request.getMethod();

        // Handle OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Skip JWT validation for public URLs
        if (isPublicUrl(path)) {
            log.debug("Public URL accessed: {}", path);
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = extractJwtFromRequest(request);

            if (jwt != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                authenticateUser(jwt, request);
            } else if (jwt == null) {
                log.debug("No JWT token found for protected endpoint: {}", path);
            }

        } catch (ExpiredJwtException ex) {
            log.warn("JWT token expired for request: {} - {}", path, ex.getMessage());
            request.setAttribute("expired", "Token has expired");
        } catch (SignatureException ex) {
            log.error("Invalid JWT signature for request: {} - {}", path, ex.getMessage());
            request.setAttribute("invalid", "Invalid token signature");
        } catch (MalformedJwtException ex) {
            log.error("Malformed JWT token for request: {} - {}", path, ex.getMessage());
            request.setAttribute("malformed", "Malformed token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT token parsing error for request: {} - {}", path, ex.getMessage());
            request.setAttribute("error", "Token parsing error");
        } catch (Exception ex) {
            log.error("Unexpected JWT authentication error for request: {}: {}", path, ex.getMessage());
            request.setAttribute("error", "Authentication error");
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
     * Extract JWT token from Authorization header
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        final String authHeader = request.getHeader(AUTH_HEADER);

        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            String token = authHeader.substring(BEARER_PREFIX.length()).trim();

            // Basic validation
            if (!token.isEmpty()) {
                return token;
            }
        }

        return null;
    }

    /**
     * Authenticate user and set security context
     */
    private void authenticateUser(String jwt, HttpServletRequest request) {
        try {
            final String username = jwtService.extractUsername(jwt);

            if (username == null || username.trim().isEmpty()) {
                log.warn("JWT token contains null or empty username");
                return;
            }

            log.debug("Attempting to authenticate user: {}", username);

            final UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("Successfully authenticated user: {} with authorities: {}",
                        username, userDetails.getAuthorities());
            } else {
                log.warn("Invalid JWT token for user: {}", username);
            }
        } catch (Exception ex) {
            log.error("Error during user authentication: {}", ex.getMessage());
            // Don't set authentication - let the request continue to be rejected by AuthenticationEntryPoint
        }
    }

    /**
     * Determines if this filter should not run for this request
     * Can be overridden to completely skip the filter for certain paths
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Always run for OPTIONS to handle CORS
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return false;
        }

        // Can add additional logic here if needed
        return false;
    }
}