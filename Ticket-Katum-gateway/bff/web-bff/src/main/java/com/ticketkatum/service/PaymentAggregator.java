package com.ticketkatum.service;

import com.ticketkatum.client.BookingServiceClient;
import com.ticketkatum.client.PaymentServiceClient;
import com.ticketkatum.dto.payment.PaymentProviderDTO;
import com.ticketkatum.dto.payment.PaymentVerificationWithBooking;
import com.ticketkatum.dto.payment.TransactionDetailsResponse;
import com.ticketkatum.dto.payment.request.PaymentRequest;
import com.ticketkatum.dto.payment.request.VerifyPaymentRequest;
import com.ticketkatum.dto.payment.response.PaymentInitiationResponse;
import com.ticketkatum.dto.payment.response.PaymentProvider;
import com.ticketkatum.exception.AggregationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Payment Domain Aggregator
 * Handles payment-related aggregations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentAggregator {

    private final PaymentServiceClient paymentClient;
    private final BookingServiceClient bookingClient;

    /**
     * Initiate payment with booking validation
     */
    public CompletableFuture<PaymentInitiationResponse> initiatePaymentWithValidation(
            String provider, PaymentRequest paymentRequest) {


        // Can add booking validation here if needed
        return paymentClient.initiatePayment(provider, paymentRequest)
                .thenApply(paymentResponse ->
                        PaymentInitiationResponse.builder()
                                .paymentResponse(paymentResponse)
                                .provider(provider)
                                .build()
                )
                .exceptionally(ex -> {
                    log.error("Payment initiation failed", ex);
                    throw new AggregationException("Payment failed", ex);
                });
    }

    /**
     * Verify payment and update booking
     */
    public CompletableFuture<PaymentVerificationWithBooking> verifyPaymentAndUpdateBooking(
            String provider, VerifyPaymentRequest verifyRequest) {

        log.info("Verifying payment: {}", verifyRequest.getTransactionId());

        return paymentClient.verifyPayment(provider, verifyRequest)
                .thenApply(verificationResponse -> {
                    // Can trigger booking status update here
                    return PaymentVerificationWithBooking.builder()
                            .verificationResponse(verificationResponse)
                            .bookingUpdated(verificationResponse.isVerified())
                            .build();
                })
                .exceptionally(ex -> {
                    log.error("Payment verification failed", ex);
                    throw new AggregationException("Verification failed", ex);
                });
    }

    /**
     * Get payment providers with status
     */
    public CompletableFuture<List<PaymentProviderDTO>> getAvailableProviders() {
        log.info("Fetching available payment providers");

        return paymentClient.getPaymentProviders()
                .thenApply(providers -> {
                    return providers.stream()
                            .filter(PaymentProviderDTO::isEnabled)
                            .collect(Collectors.toList());
                });
    }


    /**
     * Get transaction details with booking info
     */
    public CompletableFuture<TransactionDetailsResponse> getTransactionDetails(
            String transactionId) {

        log.info("Fetching transaction details: {}", transactionId);

        return paymentClient.getTransactionStatus(transactionId)
                .thenApply(transactionStatus ->
                        TransactionDetailsResponse.builder()
                                .transactionStatus(transactionStatus)
                                .build()
                );
    }
}
