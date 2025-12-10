package com.ticketkatum.payment.provider;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.configs.config.EsewaConfig;
import com.ticketkatum.entity.PaymentTransaction;
import com.ticketkatum.utils.Request;
import com.ticketkatum.utils.Response;
import com.ticketkatum.model.ResponseHandler;
import com.ticketkatum.payment.PaymentProvider;
import com.ticketkatum.payment.request.InitiatePaymentRequest;
import com.ticketkatum.payment.request.PaymentResponse;
import com.ticketkatum.payment.request.VerifyPaymentRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component("esewa")
@RequiredArgsConstructor
public class EsewaPaymentProvider implements PaymentProvider {

    private final EsewaConfig esewaConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final int MAX_RETRY_ATTEMPTS = 3;

    @Override
    public Response doPayment(Request request, PaymentTransaction txn) {
        log.info("Initiating eSewa payment for transaction: {}", txn.getInternalTxnId());

        try {
            InitiatePaymentRequest initiatePaymentRequest = (InitiatePaymentRequest) request;

            // Validate request
            validatePaymentRequest(initiatePaymentRequest, txn);

            // Calculate service charge (if applicable)
            double serviceCharge = calculateServiceCharge(request.getAmount());
            double totalAmount = request.getAmount() + serviceCharge;

            // Prepare eSewa payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("amount", request.getAmount());
            payload.put("tax_amount", 0);
            payload.put("total_amount", totalAmount);
            payload.put("transaction_uuid", txn.getInternalTxnId());
            payload.put("product_code", esewaConfig.getMerchantCode());
            payload.put("product_service_charge", serviceCharge);
            payload.put("product_delivery_charge", 0);
            payload.put("success_url", buildCallbackUrl(initiatePaymentRequest.getSuccessUrl(), txn.getInternalTxnId()));
            payload.put("failure_url", buildCallbackUrl(initiatePaymentRequest.getFailureUrl(), txn.getInternalTxnId()));

            // Add signature for security (if eSewa supports it)
            String signature = generateSignature(payload);
            if (signature != null) {
                payload.put("signature", signature);
            }

            // Prepare response data with clear instructions
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("gatewayUrl", esewaConfig.getBaseUrl());
            responseData.put("method", "POST");
            responseData.put("params", payload);
            responseData.put("transactionId", txn.getInternalTxnId());
            responseData.put("amount", request.getAmount());
            responseData.put("totalAmount", totalAmount);
            responseData.put("expiresIn", 1800); // 30 minutes in seconds
            responseData.put("instructions", "Redirect user to gatewayUrl with params using POST method");

            // Build payment response
            PaymentResponse paymentResponse = PaymentResponse.builder()
                    .status("INITIATED")
                    .message("Payment gateway URL generated successfully")
                    .data(responseData)
                    .transactionId(txn.getInternalTxnId())
                    .amount(BigDecimal.valueOf(request.getAmount()))
                    .build();

            log.info("eSewa payment initiated successfully - TxnId: {}, Amount: {}",
                    txn.getInternalTxnId(), totalAmount);

            return ResponseHandler.successWildcard("Payment initiated successfully", paymentResponse);

        } catch (ClassCastException e) {
            log.error("Invalid request type for eSewa payment", e);
            return ResponseHandler.failureWildcard("Invalid Request", "Expected InitiatePaymentRequest");
        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            return ResponseHandler.failureWildcard("Validation Error", e.getMessage());
        } catch (Exception e) {
            log.error("Error initiating eSewa payment for txn: {}", txn.getInternalTxnId(), e);
            return ResponseHandler.failureWildcard(
                    "Payment Initiation Failed",
                    "Failed to initiate eSewa payment: " + e.getMessage()
            );
        }
    }

    @Override
    public Response verifyPayment(Request request, PaymentTransaction txn) {
        log.info("Verifying eSewa payment for transaction: {}", txn.getInternalTxnId());

        int retryCount = 0;
        Exception lastException = null;

        while (retryCount < MAX_RETRY_ATTEMPTS) {
            try {
                VerifyPaymentRequest verifyPaymentRequest = (VerifyPaymentRequest) request;

                // Validate verification request
                if (verifyPaymentRequest.getTransactionId() == null ||
                        verifyPaymentRequest.getTransactionId().isEmpty()) {
                    throw new IllegalArgumentException("Transaction ID is required for verification");
                }

                // Prepare verification parameters
                MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
                params.add("product_code", esewaConfig.getMerchantCode());
                params.add("total_amount", String.valueOf(txn.getAmount()));
                params.add("transaction_uuid", txn.getInternalTxnId());



                // Set headers
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
                headers.set("User-Agent", "TicketKatum-Payment-Gateway/1.0");

                HttpEntity<MultiValueMap<String, String>> requestEntity =
                        new HttpEntity<>(params, headers);

                log.debug("Sending verification request to eSewa - Attempt: {}", retryCount + 1);

                // Call eSewa verification API
                ResponseEntity<String> responseEntity = restTemplate.exchange(
                        esewaConfig.getVerifyUrl(),
                        HttpMethod.POST,
                        requestEntity,
                        String.class
                );

                String verifyResponse = responseEntity.getBody();
                log.info("eSewa verification response received - Status: {}",
                        responseEntity.getStatusCode());
                log.debug("Response body: {}", verifyResponse);

                // Parse verification response
                VerificationResult result = parseVerificationResponse(verifyResponse);

                if (result.isSuccess()) {
                    // Build success response
                    Map<String, Object> responseData = new HashMap<>();
                    responseData.put("transactionId", txn.getInternalTxnId());
                    responseData.put("externalTxnId", result.getRefId());
                    responseData.put("amount", txn.getAmount());
                    responseData.put("status", "SUCCESS");
                    responseData.put("verifiedAt", new Date());
                    responseData.put("gatewayResponse", result.getRawResponse());

                    PaymentResponse paymentResponse = PaymentResponse.builder()
                            .status("SUCCESS")
                            .message("Payment verified successfully")
                            .data(responseData)
                            .transactionId(txn.getInternalTxnId())
                            .amount(txn.getAmount())
                            .build();

                    log.info("eSewa payment verified successfully - TxnId: {}, RefId: {}",
                            txn.getInternalTxnId(), result.getRefId());

                    return ResponseHandler.successWildcard(
                            "Payment verified successfully",
                            paymentResponse
                    );
                } else {
                    // Build failure response
                    Map<String, Object> responseData = new HashMap<>();
                    responseData.put("transactionId", txn.getInternalTxnId());
                    responseData.put("status", "FAILED");
                    responseData.put("failureReason", result.getFailureReason());
                    responseData.put("gatewayResponse", result.getRawResponse());

                    PaymentResponse paymentResponse = PaymentResponse.builder()
                            .status("FAILED")
                            .message(result.getFailureReason())
                            .data(responseData)
                            .transactionId(txn.getInternalTxnId())
                            .amount(txn.getAmount())
                            .build();

                    log.warn("eSewa payment verification failed - TxnId: {}, Reason: {}",
                            txn.getInternalTxnId(), result.getFailureReason());

                    return ResponseHandler.failureWildcard(
                            "Payment Verification Failed",
                            result.getFailureReason()
                    );
                }

            } catch (HttpClientErrorException | HttpServerErrorException e) {
                lastException = e;
                log.warn("HTTP error during verification - Attempt: {}, Status: {}",
                        retryCount + 1, e.getStatusCode());

                if (e.getStatusCode().is4xxClientError()) {
                    // Don't retry for client errors
                    break;
                }

                retryCount++;
                if (retryCount < MAX_RETRY_ATTEMPTS) {
                    sleep(1000 * retryCount); // Exponential backoff
                }

            } catch (ClassCastException e) {
                log.error("Invalid request type for eSewa verification", e);
                return ResponseHandler.failureWildcard("Invalid Request",
                        "Expected VerifyPaymentRequest");
            } catch (IllegalArgumentException e) {
                log.error("Validation error: {}", e.getMessage());
                return ResponseHandler.failureWildcard("Validation Error", e.getMessage());
            } catch (Exception e) {
                lastException = e;
                log.error("Error verifying eSewa payment - Attempt: {}", retryCount + 1, e);

                retryCount++;
                if (retryCount < MAX_RETRY_ATTEMPTS) {
                    sleep(1000 * retryCount);
                }
            }
        }

        // All retries exhausted
        log.error("All verification attempts failed for transaction: {}",
                txn.getInternalTxnId());

        return ResponseHandler.failureWildcard(
                "Payment Verification Error",
                "Failed to verify payment after " + MAX_RETRY_ATTEMPTS + " attempts. " +
                        "Error: " + (lastException != null ? lastException.getMessage() : "Unknown error")
        );
    }

    // Helper methods

    private void validatePaymentRequest(InitiatePaymentRequest request,
                                        PaymentTransaction txn) {
        if (request.getAmount() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }

        if (request.getAmount() > 100000) { // Max 1 lakh per transaction
            throw new IllegalArgumentException("Amount exceeds maximum limit of NPR 100,000");
        }

        if (request.getSuccessUrl() == null || request.getSuccessUrl().isEmpty()) {
            throw new IllegalArgumentException("Success URL is required");
        }

        if (request.getFailureUrl() == null || request.getFailureUrl().isEmpty()) {
            throw new IllegalArgumentException("Failure URL is required");
        }
    }

    private double calculateServiceCharge(double amount) {
        // eSewa charges approximately 1-2% service charge
        // Adjust based on your agreement with eSewa
        return Math.round(amount * 0.02 * 100.0) / 100.0; // 2% rounded to 2 decimals
    }

    private String buildCallbackUrl(String baseUrl, String transactionId) {
        if (baseUrl.contains("?")) {
            return baseUrl + "&txnId=" + transactionId;
        } else {
            return baseUrl + "?txnId=" + transactionId;
        }
    }

    private String generateSignature(Map<String, Object> payload) {
        try {
            if (esewaConfig.getSecretKey() == null || esewaConfig.getSecretKey().isEmpty()) {
                log.warn("eSewa secret key not configured, skipping signature generation");
                return null;
            }

            // Create signature string from payload
            String signatureData = String.format(
                    "total_amount=%s,transaction_uuid=%s,product_code=%s",
                    payload.get("total_amount"),
                    payload.get("transaction_uuid"),
                    payload.get("product_code")
            );

            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    esewaConfig.getSecretKey().getBytes(StandardCharsets.UTF_8),
                    HMAC_SHA256
            );
            mac.init(secretKeySpec);

            byte[] hash = mac.doFinal(signatureData.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);

        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Error generating signature", e);
            return null;
        }
    }

    private VerificationResult parseVerificationResponse(String response) {
        VerificationResult result = new VerificationResult();
        result.setRawResponse(response);

        if (response == null || response.isEmpty()) {
            log.error("Empty verification response from eSewa");
            result.setSuccess(false);
            result.setFailureReason("Empty response from payment gateway");
            return result;
        }

        try {
            // eSewa returns XML or JSON response
            // Check for success indicators
            boolean isSuccess = response.toLowerCase().contains("success") ||
                    response.toLowerCase().contains("complete") ||
                    response.toLowerCase().contains("\"status\":\"success\"") ||
                    response.contains("<status>Success</status>");

            result.setSuccess(isSuccess);

            if (isSuccess) {
                // Extract reference ID from response
                String refId = extractRefId(response);
                result.setRefId(refId);
                log.debug("Verification successful - RefId: {}", refId);
            } else {
                // Extract failure reason
                String failureReason = extractFailureReason(response);
                result.setFailureReason(failureReason);
                log.debug("Verification failed - Reason: {}", failureReason);
            }

        } catch (Exception e) {
            log.error("Error parsing verification response", e);
            result.setSuccess(false);
            result.setFailureReason("Failed to parse gateway response");
        }

        return result;
    }

    private String extractRefId(String response) {
        // Extract reference ID from XML or JSON response
        // Adjust regex based on actual eSewa response format
        try {
            if (response.contains("ref_id")) {
                int start = response.indexOf("ref_id") + 8;
                int end = response.indexOf("\"", start);
                if (end == -1) end = response.indexOf("<", start);
                if (end > start) {
                    return response.substring(start, end).trim();
                }
            }
            return "N/A";
        } catch (Exception e) {
            log.warn("Could not extract ref_id from response", e);
            return "N/A";
        }
    }

    private String extractFailureReason(String response) {
        try {
            if (response.toLowerCase().contains("insufficient")) {
                return "Insufficient balance in eSewa wallet";
            } else if (response.toLowerCase().contains("invalid")) {
                return "Invalid transaction or credentials";
            } else if (response.toLowerCase().contains("expired")) {
                return "Transaction expired";
            } else if (response.toLowerCase().contains("cancelled")) {
                return "Transaction cancelled by user";
            } else {
                return "Payment verification failed. Please contact support.";
            }
        } catch (Exception e) {
            return "Payment verification failed";
        }
    }

    private void sleep(long milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Sleep interrupted", e);
        }
    }

    // Inner class for verification result
    private static class VerificationResult {
        private boolean success;
        private String refId;
        private String failureReason;
        private String rawResponse;

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public String getRefId() { return refId; }
        public void setRefId(String refId) { this.refId = refId; }

        public String getFailureReason() { return failureReason; }
        public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

        public String getRawResponse() { return rawResponse; }
        public void setRawResponse(String rawResponse) { this.rawResponse = rawResponse; }
    }
}