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

    // ============================
    // Admin Registration
    // ============================

    public Mono<ApiResponse<String>> registerAdmin(AdminRegistrationRequestWeb request) {
        log.info("BFF: Processing admin registration request for email: {}", request.getEmail());

        return Mono.fromFuture(() -> registrationServiceClient.registerAdmin(request))
                .map(resp -> ApiResponse.<String>builder().message(resp.getMessage()).data(null).build())
                .doOnSuccess(r -> log.info("BFF: Registration request successful for: {}", request.getEmail()))
                .doOnError(e -> log.error("BFF: Registration request failed: {}", e.getMessage()))
                .onErrorResume(this::handleError);
    }

    public Mono<ApiResponse<String>> approveRequest(Long requestId, String bearerToken) {
        log.info("BFF: Approving registration request ID: {}", requestId);

        return Mono.fromFuture(() -> registrationServiceClient.approveRequest(requestId, bearerToken))
                .map(resp -> ApiResponse.<String>builder().message(resp.getMessage()).data(null).build())
                .doOnSuccess(r -> log.info("BFF: Registration approved for ID: {}", requestId))
                .doOnError(e -> log.error("BFF: Approval failed: {}", e.getMessage()))
                .onErrorResume(this::handleError);
    }

    public Mono<ApiResponse<String>> rejectRequest(Long requestId, String bearerToken) {
        log.info("BFF: Rejecting registration request ID: {}", requestId);

        return Mono.fromFuture(() -> registrationServiceClient.rejectRequest(requestId, bearerToken))
                .map(resp -> ApiResponse.<String>builder().message(resp.getMessage()).data(null).build())
                .doOnSuccess(r -> log.info("BFF: Registration rejected for ID: {}", requestId))
                .doOnError(e -> log.error("BFF: Rejection failed: {}", e.getMessage()))
                .onErrorResume(this::handleError);
    }

    // ============================
    // Fetch Requests
    // ============================

    public Mono<ApiResponse> getAllRequests(String bearerToken) {
        log.info("BFF: Fetching all registration requests");

        return Mono.fromFuture(() -> registrationServiceClient.getAllRequests(bearerToken))
                .map(list -> ApiResponse.<List<Map<String, Object>>>builder().data((List) list).message("Success").build())
                .doOnSuccess(r -> log.info("BFF: Retrieved {} requests", r.getData()))
                .doOnError(e -> log.error("BFF: Failed to fetch requests: {}", e.getMessage()))
                .onErrorResume(this::handleError);
    }

    public Mono<ApiResponse<Map<String, Object>>> getRequestById(Long requestId, String bearerToken) {
        log.info("BFF: Fetching registration request ID: {}", requestId);

        return Mono.fromFuture(() -> registrationServiceClient.getRequestById(requestId, bearerToken))
                .map(dto -> ApiResponse.<Map<String, Object>>builder().data(dto != null ? Map.of("request", dto) : Collections.emptyMap()).message("Success").build())
                .doOnSuccess(r -> log.info("BFF: Retrieved request details for ID: {}", requestId))
                .doOnError(e -> log.error("BFF: Failed to fetch request: {}", e.getMessage()))
                .onErrorResume(this::handleError);
    }

    // ============================
    // Password / OTP
    // ============================

    public Mono<ApiResponse<String>> changePassword(ChangePasswordRequest request, String bearerToken) {
        log.info("BFF: Processing password change for user: {}", request.getUsername());

        return Mono.fromFuture(() -> registrationServiceClient.changePassword(request, bearerToken))
                .map(resp -> ApiResponse.<String>builder().message(resp.getMessage()).data(null).build())
                .doOnSuccess(r -> log.info("BFF: Password changed successfully"))
                .doOnError(e -> log.error("BFF: Password change failed: {}", e.getMessage()))
                .onErrorResume(this::handleError);
    }

    public Mono<ApiResponse<String>> sendOtp(OtpRequestWeb request) {
        log.info("BFF: Sending OTP to user: {}", request.getUsername());

        return Mono.fromFuture(() -> registrationServiceClient.sendOtp(request.getUsername()))
                .map(resp -> ApiResponse.<String>builder().message(resp.getMessage()).data(null).build())
                .doOnSuccess(r -> log.info("BFF: OTP sent successfully"))
                .doOnError(e -> log.error("BFF: OTP send failed: {}", e.getMessage()))
                .onErrorResume(this::handleError);
    }

    // ============================
    // Error Handling
    // ============================

    private <T> Mono<ApiResponse<T>> handleError(Throwable error) {
        log.error("BFF: Unexpected error: {}", error.getMessage());
        if (error instanceof ResourceNotFoundException) {
            return Mono.just(ApiResponse.<T>builder().message("Resource not found").data(null).build());
        } else if (error instanceof BadRequestException) {
            return Mono.just(ApiResponse.<T>builder().message("Bad request").data(null).build());
        }
        return Mono.just(ApiResponse.<T>builder().message("Service unavailable").data(null).build());
    }
}
