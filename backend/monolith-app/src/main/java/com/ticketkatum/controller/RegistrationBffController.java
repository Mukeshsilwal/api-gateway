package com.ticketkatum.controller;

import com.ticketkatum.dto.auth.AdminRegistrationRequestWeb;
import com.ticketkatum.dto.auth.request.ApiResponse;
import com.ticketkatum.dto.auth.request.ChangePasswordRequest;
import com.ticketkatum.dto.auth.request.OtpRequestWeb;
import com.ticketkatum.dto.auth.response.RegistrationResponse;
import com.ticketkatum.service.RegistrationBffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Registration BFF Controller
 * Backend for Frontend layer for Registration Service
 */
@RestController
@RequestMapping("/api/bff/v1/registration")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class RegistrationBffController {

    private final RegistrationBffService bffService;

    /**
     * Submit admin registration request
     * POST /api/bff/registration/admin/request
     */
    @PostMapping("/admin/request")
    public Mono<ResponseEntity<ApiResponse<RegistrationResponse>>> registerAdmin(
            @Valid @RequestBody AdminRegistrationRequestWeb request) {

        log.info("BFF Controller: Received admin registration request for: {}", request.getEmail());

        return bffService.registerAdmin(request)
                .map(response -> response.isSuccess()
                        ? ResponseEntity.status(HttpStatus.CREATED).body(response)
                        : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response))
                .onErrorResume(error -> {
                    log.error("BFF Controller: Registration failed", error);
                    return Mono.just(ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(ApiResponse.<RegistrationResponse>builder()
                                    .success(false)
                                    .message("Registration failed: " + error.getMessage())
                                    .build()));
                });
    }

    /**
     * Approve admin registration request
     * POST /api/bff/registration/admin/approve/{requestId}
     */
    @PostMapping("/admin/approve/{requestId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Mono<ResponseEntity<ApiResponse<String>>> approveRequest(
            @PathVariable("requestId") Long requestId,
            @RequestHeader("Authorization") String authorization) {

        log.info("BFF Controller: Approving request ID: {}", requestId);

        String token = extractToken(authorization);

        return bffService.approveRequest(requestId, token)
                .map(response -> response.isSuccess()
                        ? ResponseEntity.ok(response)
                        : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response))
                .onErrorResume(error -> {
                    log.error("BFF Controller: Approval failed", error);
                    return Mono.just(ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(ApiResponse.<String>builder()
                                    .success(false)
                                    .message("Approval failed: " + error.getMessage())
                                    .build()));
                });
    }

    /**
     * Reject admin registration request
     * DELETE /api/bff/registration/admin/reject/{requestId}
     */
    @DeleteMapping("/admin/reject/{requestId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Mono<ResponseEntity<ApiResponse<String>>> rejectRequest(
            @PathVariable Long requestId,
            @RequestHeader("Authorization") String authorization) {

        log.info("BFF Controller: Rejecting request ID: {}", requestId);

        String token = extractToken(authorization);

        return bffService.rejectRequest(requestId, token)
                .map(response -> response.isSuccess()
                        ? ResponseEntity.ok(response)
                        : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response))
                .onErrorResume(error -> {
                    log.error("BFF Controller: Rejection failed", error);
                    return Mono.just(ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(ApiResponse.<String>builder()
                                    .success(false)
                                    .message("Rejection failed: " + error.getMessage())
                                    .build()));
                });
    }

    /**
     * Get all registration requests
     * GET /api/bff/registration/admin/requests
     */
    @GetMapping("/admin/requests")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Mono<ResponseEntity<ApiResponse<List<?>>>> getAllRequests(
            @RequestHeader("Authorization") String authorization) {

        log.info("BFF Controller: Fetching all requests");

        String token = extractToken(authorization);

        return bffService.getAllRequests(token)
                .map(ResponseEntity::ok)
                .onErrorResume(error -> {
                    log.error("BFF Controller: Failed to fetch requests", error);
                    return Mono.just(ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(ApiResponse.<List<?>>builder()
                                    .success(false)
                                    .message("Failed to fetch requests: " + error.getMessage())
                                    .build()));
                });
    }

    /**
     * Get registration request by ID
     * GET /api/bff/registration/admin/requests/{requestId}
     */
    @GetMapping("/admin/requests/{requestId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Mono<ResponseEntity<ApiResponse<Map<String, Object>>>> getRequestById(
            @PathVariable Long requestId,
            @RequestHeader("Authorization") String authorization) {

        log.info("BFF Controller: Fetching request ID: {}", requestId);

        String token = extractToken(authorization);

        return bffService.getRequestById(requestId, token)
                .map(response -> response.isSuccess()
                        ? ResponseEntity.ok(response)
                        : ResponseEntity.status(HttpStatus.NOT_FOUND).body(response))
                .onErrorResume(error -> {
                    log.error("BFF Controller: Failed to fetch request", error);
                    return Mono.just(ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(ApiResponse.<Map<String, Object>>builder()
                                    .success(false)
                                    .message("Failed to fetch request: " + error.getMessage())
                                    .build()));
                });
    }

    /**
     * Change user password
     * POST /api/bff/registration/change-password
     */
    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public Mono<ResponseEntity<ApiResponse<String>>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @RequestHeader("Authorization") String authorization) {

        log.info("BFF Controller: Changing password for: {}", request.getUsername());

        String token = extractToken(authorization);

        return bffService.changePassword(request, token)
                .map(response -> response.isSuccess()
                        ? ResponseEntity.ok(response)
                        : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response))
                .onErrorResume(error -> {
                    log.error("BFF Controller: Password change failed", error);
                    return Mono.just(ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(ApiResponse.<String>builder()
                                    .success(false)
                                    .message("Password change failed: " + error.getMessage())
                                    .build()));
                });
    }

    /**
     * Send OTP to user
     * POST /api/bff/registration/send-otp
     */
    @PostMapping("/send-otp")
    public Mono<ResponseEntity<ApiResponse<Map<String, Object>>>> sendOtp(
            @Valid @RequestBody OtpRequestWeb request) {

        log.info("BFF Controller: Sending OTP to: {}", request.getUsername());

        return bffService.sendOtp(request)
                .map(response -> response.isSuccess()
                        ? ResponseEntity.ok(response)
                        : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response))
                .onErrorResume(error -> {
                    log.error("BFF Controller: OTP send failed", error);
                    return Mono.just(ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(ApiResponse.<Map<String, Object>>builder()
                                    .success(false)
                                    .message("OTP send failed: " + error.getMessage())
                                    .build()));
                });
    }

    /**
     * Health check endpoint
     * GET /api/bff/registration/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Registration BFF",
                "version", "1.0.0"
        ));
    }

    /**
     * Extract Bearer token from Authorization header
     */
    private String extractToken(String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return authorization;
    }
}