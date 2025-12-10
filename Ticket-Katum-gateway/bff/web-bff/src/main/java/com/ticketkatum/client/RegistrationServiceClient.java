package com.ticketkatum.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.config.ServiceUrlConfig;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.auth.AdminRegistrationRequestDto;
import com.ticketkatum.dto.auth.AdminRegistrationRequestWeb;
import com.ticketkatum.dto.auth.request.ChangePasswordRequest;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class RegistrationServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;

    private static final String SERVICE_NAME = "registration-service";
    private static final String CIRCUIT_BREAKER_NAME = "registrationService";

    private WebClient getWebClient() {
        return webClientBuilder
                .baseUrl(serviceUrls.getRegistrationServiceUrl())
                .build();
    }

    // ============================================
    // Registration Requests
    // ============================================

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "registerAdminFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<Response<Void>> registerAdmin(AdminRegistrationRequestWeb request) {
        log.debug("Registering admin: {}", request.getEmail());

        return getWebClient()
                .post()
                .uri("/api/registration/admin/request")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<Void>>() {})
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "approveRequestFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<Response<Void>> approveRequest(Long requestId, String token) {
        log.debug("Approving registration request: {}", requestId);

        return getWebClient()
                .post()
                .uri("/api/registration/admin/approve/{id}", requestId)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<Void>>() {})
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "rejectRequestFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<Response<Void>> rejectRequest(Long requestId, String token) {
        log.debug("Rejecting registration request: {}", requestId);

        return getWebClient()
                .delete()
                .uri("/api/registration/admin/reject/{id}", requestId)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<Void>>() {})
                .toFuture();
    }

    // ============================================
    // Fetch Requests
    // ============================================

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getAllRequestsFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<AdminRegistrationRequestDto>> getAllRequests(String token) {
        log.debug("Fetching all registration requests");

        return getWebClient()
                .get()
                .uri("/api/registration/admin/requests")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<List<AdminRegistrationRequestDto>>>() {})
                .map(Response::getData)
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getRequestByIdFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<AdminRegistrationRequestDto> getRequestById(Long requestId, String token) {
        log.debug("Fetching registration request: {}", requestId);

        return getWebClient()
                .get()
                .uri("/api/registration/admin/requests/{id}", requestId)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<AdminRegistrationRequestDto>>() {})
                .map(Response::getData)
                .toFuture();
    }

    // ============================================
    // Password / OTP
    // ============================================

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "changePasswordFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<Response<Void>> changePassword(ChangePasswordRequest request, String token) {
        log.debug("Changing password for user: {}", request.getUsername());

        return getWebClient()
                .post()
                .uri("/api/registration/change-password")
                .header("Authorization", "Bearer " + token)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<Void>>() {})
                .toFuture();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "sendOtpFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<Response<Void>> sendOtp(String username) {
        log.debug("Sending OTP to: {}", username);

        return getWebClient()
                .post()
                .uri("/api/registration/send-otp")
                .bodyValue(Collections.singletonMap("username", username))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Response<Void>>() {})
                .toFuture();
    }

    // ============================================
    // Fallback Methods
    // ============================================

    private CompletableFuture<Response<Void>> registerAdminFallback(AdminRegistrationRequestWeb req, Throwable ex) {
        log.warn("Fallback: registerAdmin failed for {}", req.getEmail());
        return failedResponse("Registration service unavailable");
    }

    private CompletableFuture<Response<Void>> approveRequestFallback(Long id, String token, Throwable ex) {
        log.warn("Fallback: approveRequest failed for id={}", id);
        return failedResponse("Approval service unavailable");
    }

    private CompletableFuture<Response<Void>> rejectRequestFallback(Long id, String token, Throwable ex) {
        log.warn("Fallback: rejectRequest failed for id={}", id);
        return failedResponse("Rejection service unavailable");
    }

    private CompletableFuture<List<AdminRegistrationRequestDto>> getAllRequestsFallback(String token, Throwable ex) {
        log.warn("Fallback: getAllRequests");
        return CompletableFuture.completedFuture(Collections.emptyList());
    }

    private CompletableFuture<AdminRegistrationRequestDto> getRequestByIdFallback(Long id, String token, Throwable ex) {
        log.warn("Fallback: getRequestById id={}", id);
        return CompletableFuture.completedFuture(null);
    }

    private CompletableFuture<Response<Void>> changePasswordFallback(ChangePasswordRequest req, String token, Throwable ex) {
        log.warn("Fallback: changePassword for {}", req.getUsername());
        return failedResponse("Password change unavailable");
    }

    private CompletableFuture<Response<Void>> sendOtpFallback(String username, Throwable ex) {
        log.warn("Fallback: sendOtp for {}", username);
        return failedResponse("OTP service unavailable");
    }

    // ============================================
    // Utility
    // ============================================

    private CompletableFuture<Response<Void>> failedResponse(String msg) {
        return CompletableFuture.completedFuture(
                Response.<Void>builder()
                        .message(msg)
                        .data(null)
                        .build()
        );
    }
}
