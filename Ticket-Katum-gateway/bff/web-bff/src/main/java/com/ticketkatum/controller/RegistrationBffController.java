package com.ticketkatum.controller;

import com.ticketkatum.client.RegistrationServiceClient;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.auth.AdminRegistrationRequestDto;
import com.ticketkatum.dto.auth.AdminRegistrationRequestWeb;
import com.ticketkatum.dto.auth.request.ChangePasswordRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bff/v1/registration")
@Tag(name = "Registration BFF", description = "Aggregated registration APIs for admin & users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RegistrationBffController {

    private final RegistrationServiceClient registrationClient;

    // -----------------------------------------------------------------------
    // 1. SUBMIT ADMIN REGISTRATION REQUEST
    // -----------------------------------------------------------------------
    @PostMapping("/admin/request")
    @Operation(summary = "Submit admin registration request")
    public CompletableFuture<ResponseEntity<Response<Void>>> registerAdmin(
            @Valid @RequestBody AdminRegistrationRequestWeb request) {

        log.info("BFF: Received admin registration request for email: {}", request.getEmail());

        return registrationClient.registerAdmin(request)
                .thenApply(resp ->
                        ResponseEntity.status(HttpStatus.CREATED)
                                .body(Response.<Void>builder()
                                        .statusCode(201)
                                        .message("Registration submitted successfully")
                                        .data(null)
                                        .build())
                )
                .exceptionally(ex -> {
                    log.error("Registration error for email: {}", request.getEmail(), ex);
                    return ResponseEntity.status(500)
                            .body(Response.<Void>builder()
                                    .statusCode(500)
                                    .message("Internal error: " + ex.getMessage())
                                    .data(null)
                                    .build());
                });
    }

    // -----------------------------------------------------------------------
    // 2. APPROVE REGISTRATION REQUEST
    // -----------------------------------------------------------------------
    @PostMapping("/admin/approve/{id}")
    @Operation(summary = "Approve admin registration request")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public CompletableFuture<ResponseEntity<Response<Void>>> approveRequest(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorization) {

        String token = extractToken(authorization);

        log.info("BFF: Approving admin registration ID: {}", id);

        return registrationClient.approveRequest(id, token)
                .thenApply(resp -> {
                    boolean isSuccess = resp.getStatusCode() == 200;

                    return isSuccess
                            ? ResponseEntity.ok(Response.<Void>builder()
                            .statusCode(200)
                            .message("Approved successfully")
                            .data(null)
                            .build())
                            : ResponseEntity.status(400)
                            .body(Response.<Void>builder()
                                    .statusCode(400)
                                    .message("Approval failed")
                                    .data(null)
                                    .build());
                })
                .exceptionally(ex -> {
                    log.error("Approval failed for ID {}", id, ex);
                    return ResponseEntity.status(500)
                            .body(Response.<Void>builder()
                                    .statusCode(500)
                                    .message("Internal error: " + ex.getMessage())
                                    .data(null)
                                    .build());
                });
    }

    // -----------------------------------------------------------------------
    // 3. GET ALL REGISTRATION REQUESTS
    // -----------------------------------------------------------------------
    @GetMapping("/admin/requests")
    @Operation(summary = "Get all admin registration requests")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public CompletableFuture<ResponseEntity<Response<List<AdminRegistrationRequestDto>>>> getAllRequests(
            @RequestHeader("Authorization") String authorization) {

        String token = extractToken(authorization);

        log.info("BFF: Fetching all registration requests");

        return registrationClient.getAllRequests(token)
                .thenApply(list ->
                        ResponseEntity.ok(Response.<List<AdminRegistrationRequestDto>>builder()
                                .statusCode(200)
                                .message("Requests fetched successfully")
                                .data(list)
                                .build()))
                .exceptionally(ex -> {
                    log.error("Error retrieving requests", ex);
                    return ResponseEntity.status(500)
                            .body(Response.<List<AdminRegistrationRequestDto>>builder()
                                    .statusCode(500)
                                    .message("Cannot fetch requests: " + ex.getMessage())
                                    .data(null)
                                    .build());
                });
    }

    // -----------------------------------------------------------------------
    // 4. GET REQUEST BY ID
    // -----------------------------------------------------------------------
    @GetMapping("/admin/requests/{id}")
    @Operation(summary = "Get admin registration request by ID")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public CompletableFuture<ResponseEntity<Response<AdminRegistrationRequestDto>>> getRequestById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorization) {

        String token = extractToken(authorization);

        log.info("BFF: Fetching registration request ID: {}", id);

        return registrationClient.getRequestById(id, token)
                .thenApply(req ->
                        req != null
                                ? ResponseEntity.ok(Response.<AdminRegistrationRequestDto>builder()
                                .statusCode(200)
                                .message("Request fetched")
                                .data(req)
                                .build())
                                : ResponseEntity.status(404)
                                .body(Response.<AdminRegistrationRequestDto>builder()
                                        .statusCode(404)
                                        .message("Request not found")
                                        .data(null)
                                        .build())
                )
                .exceptionally(ex -> {
                    log.error("Error fetching request ID {}", id, ex);
                    return ResponseEntity.status(500)
                            .body(Response.<AdminRegistrationRequestDto>builder()
                                    .statusCode(500)
                                    .message("Error: " + ex.getMessage())
                                    .data(null)
                                    .build());
                });
    }

    // -----------------------------------------------------------------------
    // 5. CHANGE PASSWORD
    // -----------------------------------------------------------------------
    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Change user password")
    public CompletableFuture<ResponseEntity<Response<Void>>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @RequestHeader("Authorization") String authorization) {

        String token = extractToken(authorization);

        log.info("BFF: Password change request for user {}", request.getUsername());

        return registrationClient.changePassword(request, token)
                .thenApply(resp -> {
                    boolean isSuccess = resp.getStatusCode() == 200;

                    return isSuccess
                            ? ResponseEntity.ok(Response.<Void>builder()
                            .statusCode(200)
                            .message("Password changed")
                            .data(null)
                            .build())
                            : ResponseEntity.status(400)
                            .body(Response.<Void>builder()
                                    .statusCode(400)
                                    .message("Password change failed")
                                    .data(null)
                                    .build());
                })
                .exceptionally(ex -> {
                    log.error("Password change failed", ex);
                    return ResponseEntity.status(500)
                            .body(Response.<Void>builder()
                                    .statusCode(500)
                                    .message("Error: " + ex.getMessage())
                                    .data(null)
                                    .build());
                });
    }

    // -----------------------------------------------------------------------
    // 6. SEND OTP
    // -----------------------------------------------------------------------
    @PostMapping("/send-otp")
    @Operation(summary = "Send OTP to user")
    public CompletableFuture<ResponseEntity<Response<Void>>> sendOtp(
            @RequestBody Map<String, String> body) {

        String username = body.get("username");

        log.info("BFF: Sending OTP to {}", username);

        return registrationClient.sendOtp(username)
                .thenApply(resp -> {
                    boolean isSuccess = resp.getStatusCode() == 200;

                    return isSuccess
                            ? ResponseEntity.ok(Response.<Void>builder()
                            .statusCode(200)
                            .message("OTP sent")
                            .data(null)
                            .build())
                            : ResponseEntity.status(400)
                            .body(Response.<Void>builder()
                                    .statusCode(400)
                                    .message("OTP failed")
                                    .data(null)
                                    .build());
                })
                .exceptionally(ex -> {
                    log.error("OTP failed", ex);
                    return ResponseEntity.status(500)
                            .body(Response.<Void>builder()
                                    .statusCode(500)
                                    .message("Error: " + ex.getMessage())
                                    .data(null)
                                    .build());
                });
    }

    // -----------------------------------------------------------------------
    // 7. REJECT REQUEST
    // -----------------------------------------------------------------------
    @DeleteMapping("/admin/reject/{id}")
    @Operation(summary = "Reject admin registration request")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public CompletableFuture<ResponseEntity<Response<Void>>> rejectRequest(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorization) {

        String token = extractToken(authorization);

        log.info("BFF: Rejecting admin registration ID: {}", id);

        return registrationClient.rejectRequest(id, token)
                .thenApply(resp -> {
                    boolean isSuccess = resp.getStatusCode() == 200;

                    return isSuccess
                            ? ResponseEntity.ok(Response.<Void>builder()
                            .statusCode(200)
                            .message("Rejected successfully")
                            .data(null)
                            .build())
                            : ResponseEntity.status(400)
                            .body(Response.<Void>builder()
                                    .statusCode(400)
                                    .message("Rejection failed")
                                    .data(null)
                                    .build());
                })
                .exceptionally(ex -> {
                    log.error("Rejection error", ex);
                    return ResponseEntity.status(500)
                            .body(Response.<Void>builder()
                                    .statusCode(500)
                                    .message("Error: " + ex.getMessage())
                                    .data(null)
                                    .build());
                });
    }

    // -----------------------------------------------------------------------
    // HEALTH CHECK
    // -----------------------------------------------------------------------
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> h = new HashMap<>();
        h.put("service", "Registration BFF");
        h.put("status", "UP");
        return ResponseEntity.ok(h);
    }

    // -----------------------------------------------------------------------
    // TOKEN EXTRACTOR
    // -----------------------------------------------------------------------
    private String extractToken(String header) {
        return header != null && header.startsWith("Bearer ")
                ? header.substring(7)
                : header;
    }
}
