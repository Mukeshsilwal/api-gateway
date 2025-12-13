package com.ticketkatum.controller;

import com.ticketkatum.model.PaymentProviderDTO;
import com.ticketkatum.utils.Response;
import com.ticketkatum.payment.PaymentOrchestrator;
import com.ticketkatum.payment.request.InitiatePaymentRequest;
import com.ticketkatum.payment.request.VerifyPaymentRequest;
import com.ticketkatum.utils.ResponseHandler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;


@RestController
@RequestMapping("/api/v1/payment")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "Payment Gateway", description = "Payment gateway integration APIs")
public class PaymentController {

    private final PaymentOrchestrator orchestrator;

    /**
     * Initiate payment with specified provider
     */
    @PostMapping("/initiate/{provider}")
    @Operation(summary = "Initiate Payment",
            description = "Initiate a new payment transaction with the specified provider")
    public ResponseEntity<Response> initiatePayment(
            @Parameter(description = "Payment provider (esewa, khalti, imepay, mobile_banking)")
            @PathVariable("provider") String provider,
            @Valid @RequestBody InitiatePaymentRequest request,
            HttpServletRequest httpRequest) {

        log.info("Payment initiation request - Provider: {}, Amount: {}",
                provider, request.getAmount());

        // Add IP address and user agent to metadata
        request.getMetadata().put("ipAddress", getClientIP(httpRequest));
        request.getMetadata().put("userAgent", httpRequest.getHeader("User-Agent"));

        Response response = orchestrator.initiatePayment(provider, request);

        log.info("Payment initiation response - Status: {}, Message: {}",
                response.getStatusCode(), response.getMessage());

        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /**
     * Verify payment after callback from gateway
     */
    @PostMapping("/verify/{provider}")
    @Operation(summary = "Verify Payment",
            description = "Verify payment status after gateway callback")
    public ResponseEntity<Response> verifyPayment(
            @Parameter(description = "Payment provider (esewa, khalti, imepay, mobile_banking)")
            @PathVariable("provider") String provider,
            @Valid @RequestBody VerifyPaymentRequest request) {

        log.info("Payment verification request - Provider: {}, TxnId: {}",
                provider, request.getTransactionId());

        Response response = orchestrator.verifyPayment(provider, request);

        log.info("Payment verification response - Status: {}, Message: {}",
                response.getStatusCode(), response.getMessage());

        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /**
     * Get transaction status
     */
    @GetMapping("/status/{transactionId}")
    @Operation(summary = "Get Transaction Status",
            description = "Get the current status of a payment transaction")
    public ResponseEntity<Response> getTransactionStatus(
            @Parameter(description = "Internal transaction ID")
            @PathVariable("transactionId") String transactionId) {

        log.info("Transaction status request - TxnId: {}", transactionId);

        Response response = orchestrator.getTransactionStatus(transactionId);

        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /**
     * Cancel transaction
     */
    @PostMapping("/cancel/{transactionId}")
    @Operation(summary = "Cancel Transaction",
            description = "Cancel a pending payment transaction")
    public ResponseEntity<Response> cancelTransaction(
            @Parameter(description = "Internal transaction ID")
            @PathVariable String transactionId) {

        log.info("Transaction cancellation request - TxnId: {}", transactionId);

        Response response = orchestrator.cancelTransaction(transactionId);

        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /**
     * Webhook endpoint for payment gateway callbacks
     */
    @PostMapping("/webhook/{provider}")
    @Operation(summary = "Payment Gateway Webhook",
            description = "Receive payment status updates from gateway")
    public ResponseEntity<Response> handleWebhook(
            @Parameter(description = "Payment provider")
            @PathVariable String provider,
            @RequestBody String payload,
            HttpServletRequest request) {

        log.info("Webhook received - Provider: {}, IP: {}",
                provider, getClientIP(request));
        log.debug("Webhook payload: {}", payload);

        // Validate webhook source (IP whitelisting, signature verification)
        // Process webhook asynchronously
        // Update transaction status

        // For now, return success
        return ResponseEntity.ok(new Response(200, "Webhook received", null));
    }

    /**
     * Get list of available payment providers
     */
    @GetMapping("/providers")
    @Operation(
            summary = "Get Payment Providers",
            description = "Get list of available payment gateway providers"
    )
    public ResponseEntity<Response<List<PaymentProviderDTO>>> getProviders() {

        log.info("Payment providers list requested");

        List<PaymentProviderDTO> providers = List.of(
                PaymentProviderDTO.builder()
                        .id("esewa")
                        .name("eSewa")
                        .logo("/assets/esewa-logo.png")
                        .enabled(true)
                        .maxAmount(BigDecimal.valueOf(100_000))
                        .currency("NPR")
                        .build(),
                PaymentProviderDTO.builder()
                        .id("khalti")
                        .name("Khalti")
                        .logo("/assets/khalti-logo.png")
                        .enabled(true)
                        .maxAmount(BigDecimal.valueOf(100_000))
                        .currency("NPR")
                        .build(),
                PaymentProviderDTO.builder()
                        .id("imepay")
                        .name("IME Pay")
                        .logo("/assets/imepay-logo.png")
                        .enabled(true)
                        .maxAmount(BigDecimal.valueOf(200_000))
                        .currency("NPR")
                        .build(),
                PaymentProviderDTO.builder()
                        .id("mobile_banking")
                        .name("Mobile Banking")
                        .logo("/assets/mobile-banking-logo.png")
                        .enabled(true)
                        .maxAmount(BigDecimal.valueOf(500_000))
                        .currency("NPR")
                        .build()
        );

        return ResponseEntity.ok(
                ResponseHandler.success("Providers retrieved successfully", providers)
        );
    }



    /**
     * Health check endpoint for payment gateway
     */
    @GetMapping("/health")
    @Operation(summary = "Health Check",
            description = "Check if payment gateway service is healthy")
    public ResponseEntity<Response> healthCheck() {
        java.util.Map<String, Object> health = java.util.Map.of(
                "status", "UP",
                "timestamp", java.time.LocalDateTime.now(),
                "service", "Payment Gateway",
                "version", "1.0.0"
        );

        Response response = new Response(200, "Service is healthy", health);
        return ResponseEntity.ok(response);
    }

    // Helper method to get client IP address
    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }

        return request.getRemoteAddr();
    }
}