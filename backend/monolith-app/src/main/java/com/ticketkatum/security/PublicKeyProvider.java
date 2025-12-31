package com.ticketkatum.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Map;

/**
 * Provides RSA Public Key for JWT verification
 * Fetches the public key from auth-service on startup
 */
@Slf4j
@Component
public class PublicKeyProvider {

    @Value("${microservices.auth-service-url}")
    private String authServiceUrl;

    private PublicKey publicKey;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Fetch public key from auth-service on application startup
     */
    @EventListener(ApplicationReadyEvent.class)
    public void fetchPublicKey() {
        try {
            String url = authServiceUrl + "/auth/public-key";
            log.info("Fetching RSA public key from: {}", url);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.get("data") != null) {
                @SuppressWarnings("unchecked")
                Map<String, String> data = (Map<String, String>) response.get("data");
                String publicKeyPem = data.get("publicKey");

                if (publicKeyPem != null) {
                    this.publicKey = parsePublicKey(publicKeyPem);
                    log.info("Successfully loaded RSA public key from auth-service");
                } else {
                    log.error("Public key not found in response");
                }
            } else {
                log.error("Invalid response from auth-service");
            }

        } catch (Exception e) {
            log.error("Failed to fetch public key from auth-service: {}", e.getMessage());
            log.warn("JWT authentication will fail until public key is available");
        }
    }

    /**
     * Parse PEM formatted public key string to PublicKey object
     */
    private PublicKey parsePublicKey(String publicKeyPem) throws Exception {
        // Remove PEM headers and whitespace
        String publicKeyContent = publicKeyPem
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");

        // Decode base64
        byte[] keyBytes = Base64.getDecoder().decode(publicKeyContent);

        // Create PublicKey object
        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePublic(spec);
    }

    /**
     * Get the cached public key
     */
    public PublicKey getPublicKey() {
        if (publicKey == null) {
            log.warn("Public key not yet loaded, attempting to fetch...");
            fetchPublicKey();
        }
        return publicKey;
    }

    /**
     * Check if public key is available
     */
    public boolean isPublicKeyAvailable() {
        return publicKey != null;
    }
}
