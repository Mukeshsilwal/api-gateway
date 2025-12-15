package com.ticketkatum.payment;

import com.ticketkatum.dto.PaymentVerifiedEvent;
import com.ticketkatum.entity.PaymentTransaction;
import com.ticketkatum.enums.TransactionStatus;
import com.ticketkatum.jms.EmailService;
import com.ticketkatum.model.PaymentEvent;
import com.ticketkatum.payment.request.PaymentResponse;
import com.ticketkatum.service.PaymentEventPublisher;
import com.ticketkatum.utils.Response;
import com.ticketkatum.model.ResponseHandler;
import com.ticketkatum.payment.factory.PaymentProviderFactory;
import com.ticketkatum.payment.request.InitiatePaymentRequest;
import com.ticketkatum.payment.request.VerifyPaymentRequest;
import com.ticketkatum.repository.PaymentTransactionRepository;
import com.ticketkatum.service.TicketNotificationService;
import jakarta.transaction.InvalidTransactionException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentOrchestrator {

    private final PaymentTransactionRepository txnRepo;
    private final PaymentProviderFactory factory;
    private final TicketNotificationService notificationService;
    private final EmailService emailService;
    private final PaymentEventPublisher publisher;

    /**
     * Initiate payment with idempotency and duplicate check
     */
    @Transactional
    public Response initiatePayment(String provider, InitiatePaymentRequest req) {
        try {
            if (!isValidProvider(provider)) {
                log.error("Invalid payment provider: {}", provider);
                return ResponseHandler.failureWildcard("Invalid provider",
                        "Provider '" + provider + "' is not supported");
            }

            String transactionId = generateTransactionId();

            Optional<PaymentTransaction> existingTxn = txnRepo.findByInternalTxnId(transactionId);
            if (existingTxn.isPresent()) {
                PaymentTransaction txn = existingTxn.get();

                if (txn.getStatus() == TransactionStatus.SUCCESS) {
                    log.warn("Duplicate transaction detected: {}", transactionId);
//                    publisher.publishPaymentSuccess(txn.getBookingId(),txn.getAmount());
                    return ResponseHandler.successWildcard(
                            "Transaction already completed",
                            buildPaymentResponse(txn)
                    );
                }

                if (txn.getStatus() == TransactionStatus.FAILED ||
                        txn.getStatus() == TransactionStatus.EXPIRED) {
                    log.info("Retrying failed transaction: {}", transactionId);
                    txn.setRetryCount(txn.getRetryCount() + 1);
                    txn.setStatus(TransactionStatus.INITIATED);
                    txnRepo.save(txn);
                } else {
                    log.warn("Transaction already in progress: {}", transactionId);
                    return ResponseHandler.failureWildcard(
                            "Transaction already in progress",
                            "Please wait for the current transaction to complete"
                    );
                }
            }


            // Create new transaction
            PaymentTransaction txn = PaymentTransaction.builder()
                    .internalTxnId(transactionId)
                    .provider(provider)
                    .bookingId((String) req.getMetadata().get("booking_id"))
                    .amount(BigDecimal.valueOf(req.getAmount()))
                    .currency("NPR")
                    .status(TransactionStatus.INITIATED)
                    .retryCount(0)
                    .expiredAt(LocalDateTime.now().plusMinutes(30)) // 30 min expiry
                    .build();

            txn = txnRepo.save(txn);
            log.info("Transaction created: {} for provider: {}", transactionId, provider);

            // Get provider and process payment
            PaymentProvider paymentProvider = factory.get(provider);
            Response<PaymentResponse> response = paymentProvider.doPayment(req, txn);

            // Update transaction status based on response
            if (response.getStatusCode() == 200) {
                txn.setStatus(TransactionStatus.PENDING);
            } else {
                txn.setStatus(TransactionStatus.FAILED);
                txn.setFailureReason(response.getMessage());
            }
            txnRepo.save(txn);

            return response;

        } catch (Exception e) {
            log.error("Error initiating payment for provider: {}", provider, e);
            return ResponseHandler.failureWildcard(
                    "Payment initiation failed",
                    "An unexpected error occurred: " + e.getMessage()
            );
        }
    }

    /**
     * Verify payment with retry mechanism
     */
    @Transactional
    public Response verifyPayment(String provider, VerifyPaymentRequest req) {
        try {
            // Validate provider
            if (!isValidProvider(provider)) {
                log.error("Invalid payment provider: {}", provider);
                return ResponseHandler.failureWildcard("Invalid provider",
                        "Provider '" + provider + "' is not supported");
            }

            // Find transaction
            PaymentTransaction txn = txnRepo.findByInternalTxnId(req.getTransactionId())
                    .orElseThrow(() -> new InvalidTransactionException(
                            "Transaction not found: " + req.getTransactionId()
                    ));

            // Check if already verified successfully
            if (txn.getStatus() == TransactionStatus.SUCCESS) {
                log.warn("Transaction already verified: {}", req.getTransactionId());
                return ResponseHandler.successWildcard(
                        "Transaction already verified",
                        buildPaymentResponse(txn)
                );
            }

            // Check if transaction expired
            if (txn.getExpiredAt() != null && LocalDateTime.now().isAfter(txn.getExpiredAt())) {
                txn.setStatus(TransactionStatus.EXPIRED);
                txn.setFailureReason("Transaction expired");
                txnRepo.save(txn);

                log.warn("Transaction expired: {}", req.getTransactionId());
                return ResponseHandler.failureWildcard(
                        "Transaction expired",
                        "The transaction has expired. Please initiate a new payment."
                );
            }

            // Update status to processing
            txn.setStatus(TransactionStatus.VERIFICATION_PENDING);
            txnRepo.save(txn);

            // Get provider and verify
            PaymentProvider paymentProvider = factory.get(provider);
            Response response = paymentProvider.verifyPayment(req, txn);

            // Update transaction based on verification result
            if (response.getStatusCode() == 200) {
                txn.setStatus(TransactionStatus.SUCCESS);
                txn.setExternalTxnId(req.getTransactionId());
                txn.setCompletedAt(LocalDateTime.now());

                // Send success notification
                emailService.sendPaymentSuccessNotification(txn);

                log.info("Payment verified successfully: {}", req.getTransactionId());
            } else {
                txn.setStatus(TransactionStatus.FAILED);
                txn.setFailureReason(response.getMessage());

                // Send failure notification
                emailService.sendPaymentFailureNotification(txn);

                log.warn("Payment verification failed: {}", req.getTransactionId());
            }

            // Save gateway response
            txn.setGatewayResponse(response.toString());
            txnRepo.save(txn);

            return response;

        } catch (InvalidTransactionException e) {
            log.error("Invalid transaction: {}", req.getTransactionId(), e);
            return ResponseHandler.failureWildcard(
                    "Invalid transaction",
                    e.getMessage()
            );
        } catch (Exception e) {
            log.error("Error verifying payment: {}", req.getTransactionId(), e);
            return ResponseHandler.failureWildcard(
                    "Payment verification failed",
                    "An unexpected error occurred: " + e.getMessage()
            );
        }
    }

    /**
     * Get transaction status
     */
    @Transactional(readOnly = true)
    public Response getTransactionStatus(String transactionId) {
        try {
            PaymentTransaction txn = txnRepo.findByInternalTxnId(transactionId)
                    .orElseThrow(() -> new InvalidTransactionException(
                            "Transaction not found: " + transactionId
                    ));

            return ResponseHandler.successWildcard(
                    "Transaction status retrieved",
                    buildPaymentResponse(txn)
            );

        } catch (InvalidTransactionException e) {
            log.error("Transaction not found: {}", transactionId, e);
            return ResponseHandler.failureWildcard("Transaction not found", e.getMessage());
        }
    }

    /**
     * Cancel/Expire transaction
     */
    @Transactional
    public Response cancelTransaction(String transactionId) {
        try {
            PaymentTransaction txn = txnRepo.findByInternalTxnId(transactionId)
                    .orElseThrow(() -> new InvalidTransactionException(
                            "Transaction not found: " + transactionId
                    ));

            if (txn.getStatus() == TransactionStatus.SUCCESS) {
                return ResponseHandler.failureWildcard(
                        "Cannot cancel completed transaction",
                        "Transaction has already been completed successfully"
                );
            }

            txn.setStatus(TransactionStatus.CANCELLED);
            txn.setFailureReason("Cancelled by user");
            txnRepo.save(txn);

            log.info("Transaction cancelled: {}", transactionId);
            return ResponseHandler.successWildcard(
                    "Transaction cancelled successfully",
                    buildPaymentResponse(txn)
            );

        } catch (InvalidTransactionException e) {
            log.error("Transaction not found: {}", transactionId, e);
            return ResponseHandler.failureWildcard("Transaction not found", e.getMessage());
        }
    }

    // Helper methods

    private boolean isValidProvider(String provider) {
        return provider != null &&
                (provider.equalsIgnoreCase("esewa") ||
                        provider.equalsIgnoreCase("khalti") ||
                        provider.equalsIgnoreCase("imepay") ||
                        provider.equalsIgnoreCase("mobile_banking"));
    }

    private String generateTransactionId() {
        return "TXN-" + System.currentTimeMillis() + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private Object buildPaymentResponse(PaymentTransaction txn) {
        return java.util.Map.of(
                "transactionId", txn.getInternalTxnId(),
                "externalTxnId", txn.getExternalTxnId() != null ? txn.getExternalTxnId() : "",
                "status", txn.getStatus().toString(),
                "amount", txn.getAmount(),
                "currency", txn.getCurrency(),
                "provider", txn.getProvider(),
                "createdAt", txn.getCreatedAt(),
                "completedAt", txn.getCompletedAt() != null ? txn.getCompletedAt() : ""
        );
    }
}