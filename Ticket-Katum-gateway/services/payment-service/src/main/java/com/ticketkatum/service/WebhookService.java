package com.ticketkatum.service;

import com.ticketkatum.configs.KhaltiConfig;
import com.ticketkatum.entity.PaymentTransaction;
import com.ticketkatum.enums.TransactionStatus;
import com.ticketkatum.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookService {

    private final PaymentTransactionRepository transactionRepository;
    private final KhaltiConfig khaltiConfig;

    /**
     * Handle Khalti webhook notification
     */
    @Transactional
    public void handleKhaltiWebhook(Map<String, Object> payload, String signature) {
        log.info("Processing Khalti webhook | Payload: {}", payload);

        try {
            // Verify signature
            if (!verifyKhaltiSignature(payload, signature)) {
                log.error("Invalid Khalti webhook signature");
                return;
            }

            String pidx = (String) payload.get("pidx");
            String status = (String) payload.get("status");

            // Find transaction by external ID (pidx)
            PaymentTransaction txn = transactionRepository
                    .findByInternalTxnId(pidx)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Transaction not found with pidx: " + pidx));

            // Update transaction status
            updateTransactionFromWebhook(txn, status, payload);

            log.info("Khalti webhook processed | TxnId: {} | Status: {}",
                    txn.getInternalTxnId(), status);

        } catch (Exception e) {
            log.error("Error processing Khalti webhook", e);
        }
    }

    /**
     * Handle eSewa webhook notification
     */
    @Transactional
    public void handleEsewaWebhook(Map<String, Object> payload) {
        log.info("Processing eSewa webhook | Payload: {}", payload);

        try {
            String txnId = (String) payload.get("transaction_uuid");
            String status = (String) payload.get("status");

            PaymentTransaction txn = transactionRepository
                    .findByInternalTxnId(txnId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Transaction not found: " + txnId));

            updateTransactionFromWebhook(txn, status, payload);

            log.info("eSewa webhook processed | TxnId: {} | Status: {}",
                    txn.getInternalTxnId(), status);

        } catch (Exception e) {
            log.error("Error processing eSewa webhook", e);
        }
    }

    // ============ PRIVATE HELPER METHODS ============

    private boolean verifyKhaltiSignature(Map<String, Object> payload, String signature) {
        if (signature == null || signature.isEmpty()) {
            log.warn("No signature provided in webhook");
            return false;
        }

        try {
            String data = payload.toString();

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    khaltiConfig.getSecretKey().getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );
            mac.init(secretKeySpec);

            String computed = Base64.getEncoder().encodeToString(
                    mac.doFinal(data.getBytes(StandardCharsets.UTF_8))
            );

            return signature.equals(computed);

        } catch (Exception e) {
            log.error("Error verifying Khalti signature", e);
            return false;
        }
    }

    private void updateTransactionFromWebhook(
            PaymentTransaction txn, String status, Map<String, Object> payload) {

        String normalizedStatus = normalizeStatus(status);

        txn.setStatus(TransactionStatus.valueOf(normalizedStatus));
        txn.setGatewayResponse(payload.toString());
        txn.setUpdatedAt(LocalDateTime.now());

        if ("SUCCESS".equals(normalizedStatus) && txn.getCompletedAt() == null) {
            txn.setCompletedAt(LocalDateTime.now());
        }

        transactionRepository.save(txn);

        log.info("Transaction updated from webhook | TxnId: {} | Status: {}",
                txn.getInternalTxnId(), normalizedStatus);
    }

    private String normalizeStatus(String providerStatus) {
        if (providerStatus == null) return "PENDING";

        return switch (providerStatus.toUpperCase()) {
            case "COMPLETED", "SUCCESS", "VERIFIED" -> "SUCCESS";
            case "PENDING", "PROCESSING" -> "PENDING";
            case "FAILED", "CANCELLED" -> "FAILED";
            case "REFUNDED" -> "REFUNDED";
            case "EXPIRED" -> "EXPIRED";
            default -> "PENDING";
        };
    }
}