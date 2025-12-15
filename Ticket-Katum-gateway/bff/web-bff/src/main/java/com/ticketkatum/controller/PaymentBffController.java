package com.ticketkatum.controller;

import com.ticketkatum.client.PaymentServiceClient;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.payment.PaymentProviderDTO;
import com.ticketkatum.dto.payment.PaymentVerificationWithBooking;
import com.ticketkatum.dto.payment.TransactionDetailsResponse;
import com.ticketkatum.dto.payment.request.PaymentRequest;
import com.ticketkatum.dto.payment.request.VerifyPaymentRequest;
import com.ticketkatum.dto.payment.response.CancelTransactionResponse;
import com.ticketkatum.dto.payment.response.PaymentInitiationResponse;
import com.ticketkatum.dto.payment.response.PaymentProvider;
import com.ticketkatum.dto.payment.response.TransactionStatusResponse;
import com.ticketkatum.service.PaymentAggregator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Payment BFF Controller
 * Handles payment operations with aggregated data
 * Uses PaymentAggregator for domain-specific logic
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment BFF", description = "Payment management aggregated APIs")
public class PaymentBffController {

    private final PaymentAggregator paymentAggregator;
    private final PaymentServiceClient paymentClient;

    /**
     * Initiate payment with booking validation
     */
    @PostMapping("/initiate/{provider}")
    @Operation(summary = "Initiate payment with validation",
            description = "Initiate payment after validating booking")
    public CompletableFuture<ResponseEntity<Response<PaymentInitiationResponse>>> initiatePayment(
            @PathVariable String provider,
            @Valid @RequestBody PaymentRequest paymentRequest) {



        return paymentAggregator.initiatePaymentWithValidation(provider, paymentRequest)
                .thenApply(response -> ResponseEntity.ok(
                        new Response<>(200, "Payment initiated", response)))
                .exceptionally(ex -> {
                    log.error("Payment initiation failed", ex);
                    return ResponseEntity.status(400).body(
                            new Response<>(400, "Payment failed: " + ex.getMessage(), null));
                });
    }

    /**
     * Verify payment and update booking
     */
    @PostMapping("/verify/{provider}")
    @Operation(summary = "Verify payment and update booking",
            description = "Verify payment status and update related booking")
    public CompletableFuture<ResponseEntity<Response<PaymentVerificationWithBooking>>> verifyPayment(
            @PathVariable String provider,
            @Valid @RequestBody VerifyPaymentRequest request) {

        log.info("BFF: Verifying payment: {}", request.getTransactionId());

        return paymentAggregator.verifyPaymentAndUpdateBooking(provider, request)
                .thenApply(response -> ResponseEntity.ok(
                        new Response<>(200, "Payment verified", response)))
                .exceptionally(ex -> {
                    log.error("Payment verification failed", ex);
                    return ResponseEntity.status(400).body(
                            new Response<>(400, "Verification failed", null));
                });
    }

    /**
     * Get transaction details
     */
    @GetMapping("/transaction/{transactionId}")
    @Operation(summary = "Get transaction details",
            description = "Get complete transaction information")
    public CompletableFuture<ResponseEntity<Response<TransactionDetailsResponse>>> getTransactionDetails(
            @PathVariable String transactionId) {

        log.info("BFF: Fetching transaction details: {}", transactionId);

        return paymentAggregator.getTransactionDetails(transactionId)
                .thenApply(details -> ResponseEntity.ok(
                        new Response<>(200, "Transaction details retrieved", details)))
                .exceptionally(ex -> {
                    log.error("Failed to fetch transaction", ex);
                    return ResponseEntity.status(404).body(
                            new Response<>(404, "Transaction not found", null));
                });
    }

    /**
     * Get available payment providers
     */
    @GetMapping("/providers")
    @Operation(summary = "Get payment providers",
            description = "Get list of available payment providers with status")
    public CompletableFuture<ResponseEntity<Response<List<PaymentProviderDTO>>>> getProviders() {
        log.info("BFF: Fetching payment providers");

        return paymentAggregator.getAvailableProviders()
                .thenApply(providers -> ResponseEntity.ok(
                        new Response<>(200, "Providers retrieved", providers)))
                .exceptionally(ex -> {
                    log.error("Failed to fetch providers", ex);
                    return ResponseEntity.status(500).body(
                            new Response<>(500, "Providers unavailable", null));
                });
    }

    /**
     * Get transaction status (simple)
     */
    @GetMapping("/status/{transactionId}")
    @Operation(summary = "Get transaction status")
    public CompletableFuture<ResponseEntity<Response<TransactionStatusResponse>>> getTransactionStatus(
            @PathVariable String transactionId) {

        log.info("BFF: Getting transaction status: {}", transactionId);

        return paymentClient.getTransactionStatus(transactionId)
                .thenApply(status -> ResponseEntity.ok(
                        new Response<>(200, "Status retrieved", status)))
                .exceptionally(ex -> {
                    log.error("Failed to get status", ex);
                    return ResponseEntity.status(404).body(
                            new Response<>(404, "Transaction not found", null));
                });
    }

    /**
     * Cancel transaction
     */
    @PostMapping("/cancel/{transactionId}")
    @Operation(summary = "Cancel transaction")
    public CompletableFuture<ResponseEntity<Response<CancelTransactionResponse>>> cancelTransaction(
            @PathVariable String transactionId) {

        log.info("BFF: Cancelling transaction: {}", transactionId);

        return paymentClient.cancelTransaction(transactionId)
                .thenApply(response -> ResponseEntity.ok(
                        new Response<>(200, "Transaction cancelled", response)))
                .exceptionally(ex -> {
                    log.error("Transaction cancellation failed", ex);
                    return ResponseEntity.status(400).body(
                            new Response<>(400, "Cancellation failed", null));
                });
    }
}
