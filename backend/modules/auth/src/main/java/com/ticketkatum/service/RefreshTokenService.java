package com.ticketkatum.service;

import com.ticketkatum.entity.RefreshToken;
import com.ticketkatum.repository.RefreshTokenRepository;
import com.ticketkatum.repository.UserRepo;
import com.ticketkatum.entity.User;
import com.ticketkatum.exception.TokenExpiredException;
import com.ticketkatum.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.security.SecureRandom;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    @Value("${jwt.refresh.expiration.time:600000}") // Default 10 minutes
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepo userRepository;

    /**
     * Create and return a new Refresh Token
     * The raw token is returned, the hashed version is stored.
     */
    @Transactional
    public String createRefreshToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Generate secure random token
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[64];
        random.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        // Check for existing token and update, or create new
        RefreshToken refreshToken = refreshTokenRepository.findByUser(user)
                .map(existingToken -> {
                    existingToken.setToken(rawToken);
                    existingToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
                    existingToken.setRevoked(false);
                    return existingToken;
                })
                .orElseGet(() -> RefreshToken.builder()
                        .user(user)
                        .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                        .token(rawToken)
                        .revoked(false)
                        .build());

        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new TokenExpiredException(token.getToken(),
                    "Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public void deleteByUserId(Long userId) {
        userRepository.findById(userId).ifPresent(refreshTokenRepository::deleteByUser);
    }

    @Transactional
    public void revokeToken(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(t -> {
            t.setRevoked(true);
            refreshTokenRepository.save(t);
        });
    }
}
