package com.ticketkatum.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.config.ServiceUrlConfig;
import com.ticketkatum.dto.HealthCheckResponse;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.WebhookProcessingResponse;
import com.ticketkatum.dto.payment.PaymentProviderDTO;
import com.ticketkatum.dto.payment.request.PaymentRequest;
import com.ticketkatum.dto.payment.request.VerifyPaymentRequest;
import com.ticketkatum.dto.payment.response.*;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Client for Payment Gateway Microservice
 * Handles payment initiation, verification, and provider management
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;
    @Autowired
    private ObjectMapper objectMapper;

    private static final String SERVICE_NAME = "payment-service";
    private static final String CIRCUIT_BREAKER_NAME = "paymentService";

    private WebClient getWebClient() {
        return webClientBuilder
                .baseUrl(serviceUrls.getPaymentServiceUrl())
                .build();
    }

    /**
     * Initiate payment with specified provider
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "initiatePaymentFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<PaymentResponse> initiatePayment(
            String provider, PaymentRequest request) {

        log.debug("Initiating payment - Provider: {}, Amount: {}",
                provider, request.getAmount());

        return getWebClient()
                .post()
                .uri("/api/v1/payment/initiate/{provider}", provider)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), PaymentResponse.class))
                .toFuture()
                .exceptionally(ex -> {
                    log.error("Error initiating payment", ex);
                    throw new RuntimeException("Payment initiation failed", ex);
                });
    }

    /**
     * Verify payment after callback from gateway
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "verifyPaymentFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<PaymentVerificationResponse> verifyPayment(
            String provider, VerifyPaymentRequest request) {

        log.debug("Verifying payment - Provider: {}, TxnId: {}",
                provider, request.getTransactionId());

        return getWebClient()
                .post()
                .uri("/api/v1/payment/verify/{provider}", provider)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), PaymentVerificationResponse.class))
                .toFuture();
    }

    /**
     * Get transaction status
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getTransactionStatusFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<TransactionStatusResponse> getTransactionStatus(
            String transactionId) {

        log.debug("Getting transaction status - TxnId: {}", transactionId);

        return getWebClient()
                .get()
                .uri("/api/v1/payment/status/{transactionId}", transactionId)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), TransactionStatusResponse.class))
                .toFuture();
    }

    /**
     * Cancel transaction
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "cancelTransactionFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<CancelTransactionResponse> cancelTransaction(
            String transactionId) {

        log.debug("Cancelling transaction - TxnId: {}", transactionId);

        return getWebClient()
                .post()
                .uri("/api/v1/payment/cancel/{transactionId}", transactionId)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), CancelTransactionResponse.class))
                .toFuture();
    }

    /**
     * Get list of available payment providers
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "getPaymentProvidersFallback")
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<List<PaymentProviderDTO>> getPaymentProviders() {
        log.debug("Getting payment providers");

        return getWebClient()
                .get()
                .uri("/api/v1/payment/providers")
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapperList(response.getData(), PaymentProviderDTO.class))
                .toFuture();
    }


    /**
     * Health check for payment service
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME)
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<HealthCheckResponse> healthCheck() {
        log.debug("Checking payment service health");

        return getWebClient()
                .get()
                .uri("/api/v1/payment/health")
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), HealthCheckResponse.class))
                .toFuture();
    }

    /**
     * Process webhook from payment gateway
     */
    @Retry(name = SERVICE_NAME)
    public CompletableFuture<WebhookProcessingResponse> processWebhook(
            String provider, String payload) {

        log.debug("Processing webhook from provider: {}", provider);

        return getWebClient()
                .post()
                .uri("/api/v1/payment/webhook/{provider}", provider)
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(Response.class)
                .map(response -> objectMapper(response.getData(), WebhookProcessingResponse.class))
                .toFuture()
                .exceptionally(ex -> {
                    log.error("Error processing webhook", ex);
                    // Return default response
                    return WebhookProcessingResponse.builder()
                            .success(false)
                            .message("Webhook processing failed")
                            .build();
                });
    }

    // ============ Fallback Methods ============

    private CompletableFuture<PaymentResponse> initiatePaymentFallback(
            String provider, PaymentRequest request, Throwable ex) {
        log.warn("Fallback: initiatePayment for provider: {}", provider);
        return CompletableFuture.completedFuture(
                PaymentResponse.builder()
                        .status("FAILED")
                        .message("Payment service temporarily unavailable. Please try again later.")
                        .transactionId(null)
                        .build()
        );
    }

    private CompletableFuture<PaymentVerificationResponse> verifyPaymentFallback(
            String provider, VerifyPaymentRequest request, Throwable ex) {
        log.warn("Fallback: verifyPayment for transaction: {}", request.getTransactionId());
        return CompletableFuture.completedFuture(
                PaymentVerificationResponse.builder()
                        .verified(false)
                        .status("PENDING")
                        .message("Payment verification temporarily unavailable")
                        .transactionId(request.getTransactionId())
                        .build()
        );
    }

    private CompletableFuture<TransactionStatusResponse> getTransactionStatusFallback(
            String transactionId, Throwable ex) {
        log.warn("Fallback: getTransactionStatus for: {}", transactionId);
        return CompletableFuture.completedFuture(
                TransactionStatusResponse.builder()
                        .transactionId(transactionId)
                        .status("UNKNOWN")
                        .message("Transaction status unavailable")
                        .build()
        );
    }

    private CompletableFuture<CancelTransactionResponse> cancelTransactionFallback(
            String transactionId, Throwable ex) {
        log.warn("Fallback: cancelTransaction for: {}", transactionId);
        return CompletableFuture.completedFuture(
                CancelTransactionResponse.builder()
                        .transactionId(transactionId)
                        .cancelled(false)
                        .message("Transaction cancellation unavailable")
                        .build()
        );
    }

    private CompletableFuture<List<PaymentProvider>> getPaymentProvidersFallback(Throwable ex) {
        log.warn("Fallback: getPaymentProviders");
        // Return default providers
        return CompletableFuture.completedFuture(List.of(
                PaymentProvider.builder()
                        .id("esewa")
                        .name("eSewa")
                        .enabled(false)
                        .maxAmount(java.math.BigDecimal.valueOf(100000))
                        .currency("NPR")
                        .build(),
                PaymentProvider.builder()
                        .id("khalti")
                        .name("Khalti")
                        .enabled(false)
                        .maxAmount(java.math.BigDecimal.valueOf(100000))
                        .currency("NPR")
                        .build()
        ));
    }

    // Helper methods
    private <T> T objectMapper(Object data, Class<T> clazz) {
        return objectMapper.convertValue(data, clazz);
    }

    private <T> List<T> objectMapperList(Object data, Class<T> clazz) {
        if (data == null) {
            return Collections.emptyList();
        }

        if (data instanceof List<?>) {
            return objectMapper.convertValue(data,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, clazz));
        } else if (data instanceof Map<?, ?>) {
            T singleObject = objectMapper.convertValue(data, clazz);
            return Collections.singletonList(singleObject);
        } else {
            return Collections.emptyList();
        }
    }


}