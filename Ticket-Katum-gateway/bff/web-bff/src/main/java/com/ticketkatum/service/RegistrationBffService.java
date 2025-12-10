package com.ticketkatum.service;

import com.ticketkatum.client.RegistrationServiceClient;
import com.ticketkatum.dto.auth.AdminRegistrationRequestWeb;
import com.ticketkatum.dto.auth.request.ApiResponse;
import com.ticketkatum.dto.auth.request.ChangePasswordRequest;
import com.ticketkatum.dto.auth.request.OtpRequestWeb;
import com.ticketkatum.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationBffService {

    private final RegistrationServiceClient registrationServiceClient;

    /**
     * Register new admin
     */
    public Mono<ApiResponse<String>> registerAdmin(AdminRegistrationRequestWeb request) {
        log.info("BFF: Processing admin registration request for email: {}", request.getEmail());

        return Mono.fromFuture(() -> registrationServiceClient.registerAdmin(request))
                .map(resp -> ApiResponse.<String>builder()
                        .success(true)
                        .message(resp.getMessage())
                        .data(resp.getData() != null ? resp.getData().toString() : null)
                        .build())
                .doOnSuccess(r -> log.info("BFF: Registration request successful for: {}", request.getEmail()))
                .doOnError(e -> log.error("BFF: Registration request failed: {}", e.getMessage()))
                .onErrorResume(this::handleError);
    }

    /**
     * Approve registration request
     */
    public Mono<ApiResponse<String>> approveRequest(Long requestId, String bearerToken) {
        log.info("BFF: Approving registration request ID: {}", requestId);

        return Mono.fromFuture(() -> registrationServiceClient.approveRequest(requestId, bearerToken))
                .map(resp -> ApiResponse.<String>builder()
                        .success(true)
                        .message(resp.getMessage())
                        .data(null)
                        .build())
                .doOnSuccess(r -> log.info("BFF: Registration approved for ID: {}", requestId))
                .doOnError(e -> log.error("BFF: Approval failed: {}", e.getMessage()))
                .onErrorResume(this::handleError);
    }

    /**
     * Reject registration request
     */
    public Mono<ApiResponse<String>> rejectRequest(Long requestId, String bearerToken) {
        log.info("BFF: Rejecting registration request ID: {}", requestId);

        return Mono.fromFuture(() -> registrationServiceClient.rejectRequest(requestId, bearerToken))
                .map(resp -> ApiResponse.<String>builder()
                        .success(true)
                        .message(resp.getMessage())
                        .data(null)
                        .build())
                .doOnSuccess(r -> log.info("BFF: Registration rejected for ID: {}", requestId))
                .doOnError(e -> log.error("BFF: Rejection failed: {}", e.getMessage()))
                .onErrorResume(this::handleError);
    }

    /**
     * Get all registration requests
     */
    public Mono<ApiResponse<List<?>>> getAllRequests(String bearerToken) {
        log.info("BFF: Fetching all registration requests");

        return Mono.fromFuture(() -> registrationServiceClient.getAllRequests(bearerToken))
                .map(list -> ApiResponse.<List<?>>builder()
                        .success(true)
                        .message("Requests retrieved successfully")
                        .data(list)
                        .count(list != null ? list.size() : 0)
                        .build())
                .doOnSuccess(r -> log.info("BFF: Retrieved {} requests",
                        r.getCount() != null ? r.getCount() : 0))
                .doOnError(e -> log.error("BFF: Failed to fetch requests: {}", e.getMessage()))
                .onErrorResume(this::handleError);
    }

    /**
     * Get registration request by ID
     */
    public Mono<ApiResponse<Map<String, Object>>> getRequestById(Long requestId, String bearerToken) {
        log.info("BFF: Fetching registration request ID: {}", requestId);

        return Mono.fromFuture(() -> registrationServiceClient.getRequestById(requestId, bearerToken))
                .map(dto -> {
                    Map<String, Object> data = dto != null ?
                            Map.of("request", dto) : Collections.emptyMap();

                    return ApiResponse.<Map<String, Object>>builder()
                            .success(dto != null)
                            .message(dto != null ? "Request retrieved successfully" : "Request not found")
                            .data(data)
                            .build();
                })
                .doOnSuccess(r -> log.info("BFF: Retrieved request details for ID: {}", requestId))
                .doOnError(e -> log.error("BFF: Failed to fetch request: {}", e.getMessage()))
                .onErrorResume(this::handleError);
    }

    /**
     * Change user password
     */
    public Mono<ApiResponse<String>> changePassword(ChangePasswordRequest request, String bearerToken) {
        log.info("BFF: Processing password change for user: {}", request.getUsername());

        return Mono.fromFuture(() -> registrationServiceClient.changePassword(request, bearerToken))
                .map(resp -> ApiResponse.<String>builder()
                        .success(true)
                        .message(resp.getMessage())
                        .data(null)
                        .build())
                .doOnSuccess(r -> log.info("BFF: Password changed successfully for user: {}",
                        request.getUsername()))
                .doOnError(e -> log.error("BFF: Password change failed: {}", e.getMessage()))
                .onErrorResume(this::handleError);
    }

    /**
     * Send OTP to user
     */
    public Mono<ApiResponse<Map<String, Object>>> sendOtp(OtpRequestWeb request) {
        log.info("BFF: Sending OTP to user: {}", request.getUsername());

        return Mono.fromFuture(() -> registrationServiceClient.sendOtp(request.getUsername()))
                .map(resp -> {
                    Map<String, Object> otpData = Map.of(
                            "username", request.getUsername(),
                            "sentAt", System.currentTimeMillis()
                    );

                    return ApiResponse.<Map<String, Object>>builder()
                            .success(true)
                            .message(resp.getMessage())
                            .data(otpData)
                            .build();
                })
                .doOnSuccess(r -> log.info("BFF: OTP sent successfully to: {}", request.getUsername()))
                .doOnError(e -> log.error("BFF: OTP send failed: {}", e.getMessage()))
                .onErrorResume(this::handleError);
    }

    /**
     * Handle errors and convert to ApiResponse
     */
    private <T> Mono<ApiResponse<T>> handleError(Throwable error) {
        log.error("BFF: Error occurred: {}", error.getMessage(), error);

        String errorMessage = "Service unavailable";

        if (error instanceof ResourceNotFoundException) {
            errorMessage = "Resource not found: " + error.getMessage();
        } else if (error instanceof BadRequestException) {
            errorMessage = "Bad request: " + error.getMessage();
        } else if (error.getMessage() != null) {
            errorMessage = error.getMessage();
        }

        return Mono.just(ApiResponse.<T>builder()
                .success(false)
                .message(errorMessage)
                .data(null)
                .build());
    }
}