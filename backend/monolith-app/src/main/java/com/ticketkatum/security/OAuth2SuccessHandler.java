package com.ticketkatum.security;

import com.ticketkatum.client.AuthServiceClient;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;

/**
 * OAuth2 Success Handler for Web-BFF
 * Delegates OAuth2 user processing to auth-service
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthServiceClient authServiceClient;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/callback}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        try {
            // Extract user information from OAuth2 provider
            Map<String, Object> attributes = oAuth2User.getAttributes();
            String email = (String) attributes.get("email");
            String name = (String) attributes.get("name");
            String provider = getProvider(request);

            log.info("OAuth2 authentication successful for email: {} via provider: {}", email, provider);

            // Create request DTO for auth-service
            Map<String, Object> oauth2Request = Map.of(
                    "email", email,
                    "name", name != null ? name : "",
                    "provider", provider,
                    "attributes", attributes,
                    "ipAddress", getClientIP(request),
                    "userAgent", getUserAgent(request));

            // Process OAuth2 login via auth-service
            // This will create/update user, generate tokens, and create session
            Map<String, Object> authResponse = authServiceClient.processOAuth2Login(oauth2Request)
                    .get(); // Block and wait for response

            // Extract tokens from auth-service response
            String accessToken = (String) authResponse.get("accessToken");
            String refreshToken = (String) authResponse.get("refreshToken");
            String sessionId = (String) authResponse.get("sessionId");

            // Redirect to frontend with tokens
            String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                    .queryParam("accessToken", accessToken)
                    .queryParam("refreshToken", refreshToken)
                    .queryParam("sessionId", sessionId)
                    .build()
                    .toUriString();

            log.info("Redirecting to frontend: {}", targetUrl);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);

        } catch (Exception e) {
            log.error("OAuth2 authentication processing failed", e);

            // Redirect to frontend with error
            String errorUrl = UriComponentsBuilder.fromUriString(redirectUri)
                    .queryParam("error", "authentication_failed")
                    .queryParam("message", e.getMessage())
                    .build()
                    .toUriString();

            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }

    private String getProvider(HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        if (requestUri.contains("/google")) {
            return "GOOGLE";
        }
        // Add more providers as needed
        return "UNKNOWN";
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    private String getUserAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent != null ? userAgent : "Unknown";
    }
}
