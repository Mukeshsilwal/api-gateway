package com.ticketkatum.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${security.jwt.secret}")
    private String jwtSecret;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    /** ALL PUBLIC ENDPOINTS - These will skip JWT authentication completely */
    private static final String[] PUBLIC_URLS = {
            "/actuator/**",
            "/health/**",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/swagger-ui.html",
            "/api/bff/v1/auth/**",
            "/api/movies/**",
            "/api/hotels/search/**",
            "/api/hotels/*",
            "/api/bff/v1/home",
            "/api/bff/v1/hotels/**",
            "/api/bff/v1/buses/**",
            "/api/bff/v1/registration/**",
            "/api/bff/market/**",
            "/api/bff/v1/events",
            "/api/bff/v1/ai/**"

    };

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Skip filter for async dispatches - authentication was already done in
        // original request
        if (request.getDispatcherType() == jakarta.servlet.DispatcherType.ASYNC) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check if this is a public endpoint - skip JWT validation
        boolean isPublic = isPublicEndpoint(path);
        log.info("Request to path: {} - isPublic: {}", path, isPublic);

        if (isPublic) {
            log.info("Skipping JWT validation for public endpoint: {}", path);
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        // No Authorization header - let Spring Security handle it
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);

            // Use HMAC secret key for HS256 verification
            javax.crypto.SecretKey key = io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                    jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String username = claims.getSubject();
            @SuppressWarnings("unchecked")
            List<String> roles = claims.get("roles", List.class);

            if (username != null && roles != null) {
                List<SimpleGrantedAuthority> authorities = roles.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        authorities);

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Add user info to request attributes for downstream services
                request.setAttribute("userId", claims.get("userId"));
                request.setAttribute("username", username);
                request.setAttribute("roles", roles);

                log.debug("Successfully authenticated user: {}", username);
            } else {
                log.warn("JWT token missing required claims - username: {}, roles: {}", username, roles);
            }
        } catch (Exception e) {
            log.error("JWT authentication failed for path {}: {}", path, e.getMessage());
            // Don't set authentication - Spring Security will handle as unauthorized
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Check if the request path matches any public endpoint pattern
     */
    private boolean isPublicEndpoint(String path) {
        for (String publicUrl : PUBLIC_URLS) {
            if (pathMatcher.match(publicUrl, path)) {
                return true;
            }
        }
        return false;
    }
}