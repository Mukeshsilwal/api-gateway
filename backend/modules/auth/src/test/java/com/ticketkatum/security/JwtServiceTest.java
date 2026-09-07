package com.ticketkatum.security;

import com.ticketkatum.common.service.SystemConfigService;
import com.ticketkatum.entity.Permission;
import com.ticketkatum.entity.Role;
import com.ticketkatum.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class JwtServiceTest {

    @Mock
    private SystemConfigService systemConfigService;

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        when(systemConfigService.getString("JWT_SECRET")).thenReturn(
                "dMbz7o4YE45aAyT6BUYMsO_ireJ00J96Xxbv6AQ65xb0Ajauql1fScOEP4hEb7oyBtjHfTjvkeXBfpSjE8uyoA"
        );
        when(systemConfigService.getLong(org.mockito.ArgumentMatchers.eq("JWT_EXPIRATION_MS"), org.mockito.ArgumentMatchers.anyLong()))
                .thenReturn(3600000L);

        jwtService = new JwtService(systemConfigService);

        Permission readPerm = Permission.builder().id(1L).name("READ_PRIVILEGE").build();
        Role userRole = Role.builder()
                .id(1L)
                .name("USER")
                .permissions(Set.of(readPerm))
                .build();

        testUser = User.builder()
                .id(100L)
                .email("testuser@ticketkatum.com")
                .firstName("Test")
                .lastName("User")
                .password("encoded_pass")
                .roles(new HashSet<>(Set.of(userRole)))
                .enabled(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();
    }

    @Test
    @DisplayName("Generate access token and extract correct username")
    void testGenerateAccessToken_ExtractUsername() {
        String token = jwtService.generateAccessToken(testUser);

        assertNotNull(token);
        assertFalse(token.isEmpty());

        String extractedEmail = jwtService.extractUsername(token);
        assertEquals("testuser@ticketkatum.com", extractedEmail);
    }

    @Test
    @DisplayName("Token expiration is in the future")
    void testTokenExpirationDate_InFuture() {
        String token = jwtService.generateAccessToken(testUser);

        Date expiration = jwtService.extractExpiration(token);
        assertNotNull(expiration);
        assertTrue(expiration.after(new Date()));
    }

    @Test
    @DisplayName("Validate token against valid UserDetails")
    void testIsTokenValid_Success() {
        String token = jwtService.generateAccessToken(testUser);

        boolean isValid = jwtService.isTokenValid(token, testUser);
        assertTrue(isValid);
    }

    @Test
    @DisplayName("Reject token when validated against mismatched UserDetails")
    void testIsTokenValid_MismatchedUser() {
        String token = jwtService.generateAccessToken(testUser);

        User anotherUser = User.builder()
                .id(200L)
                .email("other@ticketkatum.com")
                .enabled(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();

        boolean isValid = jwtService.isTokenValid(token, anotherUser);
        assertFalse(isValid);
    }
}
