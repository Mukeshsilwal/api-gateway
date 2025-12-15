//package com.ticketkatum.payment.provider;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.ticketkatum.configs.KhaltiConfig;
//import com.ticketkatum.entity.PaymentTransaction;
//import com.ticketkatum.utils.Request;
//import com.ticketkatum.utils.Response;
//import com.ticketkatum.model.ResponseHandler;
//import com.ticketkatum.payment.PaymentProvider;
//import com.ticketkatum.payment.request.InitiatePaymentRequest;
//import com.ticketkatum.payment.request.PaymentResponse;
//import com.ticketkatum.payment.request.VerifyPaymentRequest;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.*;
//import org.springframework.stereotype.Component;
//import org.springframework.web.client.HttpClientErrorException;
//import org.springframework.web.client.HttpServerErrorException;
//import org.springframework.web.client.RestTemplate;
//
//import java.math.BigDecimal;
//import java.util.HashMap;
//import java.util.Map;
//
//@Slf4j
//@Component("khalti")
//@RequiredArgsConstructor
//public class KhaltiPaymentProvider implements PaymentProvider {
//
//    private final KhaltiConfig khaltiConfig;
//    private final RestTemplate restTemplate;
//    private final ObjectMapper objectMapper;
//
//    private static final int MAX_RETRY_ATTEMPTS = 3;
//    private static final String KHALTI_STATUS_COMPLETED = "Completed";
//    private static final String KHALTI_STATUS_PENDING = "Pending";
//    private static final String KHALTI_STATUS_REFUNDED = "Refunded";
//    private static final String KHALTI_STATUS_EXPIRED = "Expired";
//
//    @Override
//    public Response doPayment(PaymentTransaction txn) {
//        log.info("Initiating Khalti payment for transaction: {}", txn.getInternalTxnId());
//
//        try {
//            InitiatePaymentRequest initiatePaymentRequest = (InitiatePaymentRequest) request;
//
//            // Validate request
//            validatePaymentRequest(initiatePaymentRequest, txn);
//
//            // Prepare Khalti payload (amount in paisa - 1 NPR = 100 paisa)
//            Map<String, Object> body = new HashMap<>();
//            body.put("return_url", initiatePaymentRequest.getSuccessUrl());
//            body.put("website_url", initiatePaymentRequest.getMetadata()
//                    .getOrDefault("website_url", "https://ticketkatum.com").toString());
//            body.put("amount", (int) (request.getAmount() * 100)); // Convert NPR to paisa
//            body.put("purchase_order_id", txn.getInternalTxnId());
//            body.put("purchase_order_name",
//                    initiatePaymentRequest.getMetadata()
//                            .getOrDefault("order_name", "Payment").toString());
//
//            // Optional customer info
//            if (initiatePaymentRequest.getMetadata().containsKey("customer_info")) {
//                body.put("customer_info", initiatePaymentRequest.getMetadata().get("customer_info"));
//            }
//
//            // Set headers with authorization
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.APPLICATION_JSON);
//            headers.set("Authorization", "Key " + khaltiConfig.getSecretKey());
//
//            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
//
//            log.debug("Calling Khalti initiate API: {} with amount: {} paisa",
//                    khaltiConfig.getBaseUrl() + "/epayment/initiate/", body.get("amount"));
//
//            // Call Khalti initiate API
//            ResponseEntity<String> responseEntity = restTemplate.exchange(
//                    khaltiConfig.getBaseUrl() + "/epayment/initiate/",  // Now baseUrl already contains /api/v2
//                    HttpMethod.POST,
//                    entity,
//                    String.class
//            );
//
//            String responseBody = responseEntity.getBody();
//            log.debug("Khalti initiate response: {}", responseBody);
//
//            // Parse JSON response
//            Map<String, Object> result = objectMapper.readValue(responseBody, Map.class);
//
//            // Extract and validate pidx (Payment IDX from Khalti)
//            if (!result.containsKey("pidx")) {
//                log.error("No pidx in Khalti response: {}", result);
//                return ResponseHandler.failureWildcard("KHALTI_INVALID_RESPONSE",
//                        "No payment identifier received from Khalti");
//            }
//
//            String pidx = (String) result.get("pidx");
//            String paymentUrl = (String) result.get("payment_url");
//
//            if (paymentUrl == null || paymentUrl.isEmpty()) {
//                log.error("No payment URL in Khalti response: {}", result);
//                return ResponseHandler.failureWildcard("KHALTI_INVALID_RESPONSE",
//                        "No payment URL received from Khalti");
//            }
//
//            // Update transaction with pidx
//            txn.setExternalTxnId(pidx);
//
//            log.info("Khalti pidx received: {} for transaction: {}", pidx, txn.getInternalTxnId());
//
//            // Prepare response data
//            Map<String, Object> responseData = new HashMap<>();
//            responseData.put("pidx", pidx);
//            responseData.put("payment_url", paymentUrl);
//            responseData.put("transactionId", txn.getInternalTxnId());
//            responseData.put("amount", request.getAmount());
//            responseData.put("expiresIn", 1800); // 30 minutes
//            responseData.put("provider", "khalti");
//
//            // Build payment response
//            PaymentResponse paymentResponse = PaymentResponse.builder()
//                    .status("INITIATED")
//                    .message("Redirect user to Khalti payment gateway")
//                    .data(responseData)
//                    .transactionId(txn.getInternalTxnId())
//                    .amount(BigDecimal.valueOf(request.getAmount()))
//                    .build();
//
//            log.info("Khalti payment initiated successfully - TxnId: {}, pidx: {}, Amount: NPR {}",
//                    txn.getInternalTxnId(), pidx, request.getAmount());
//
//            return ResponseHandler.successWildcard("Khalti payment initiated successfully", paymentResponse);
//
//        } catch (HttpClientErrorException | HttpServerErrorException e) {
//            log.error("Khalti API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
//
//            String errorMessage = extractKhaltiErrorMessage(e.getResponseBodyAsString());
//
//            return ResponseHandler.error("KHALTI_API_ERROR",
//                    "Failed to initiate payment: " + errorMessage,
//                    HttpStatus.BAD_REQUEST);
//
//        } catch (ClassCastException e) {
//            log.error("Invalid request type for Khalti payment", e);
//            return ResponseHandler.failureWildcard("INVALID_REQUEST",
//                    "Expected InitiatePaymentRequest");
//
//        } catch (Exception e) {
//            log.error("Error initiating Khalti payment for txn: {}", txn.getInternalTxnId(), e);
//            return ResponseHandler.error("PAYMENT_INITIATION_FAILED",
//                    "Failed to initiate Khalti payment: " + e.getMessage(),
//                    HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//    }
//
//    @Override
//    public Response verifyPayment(Request request, PaymentTransaction txn) {
//        log.info("Verifying Khalti payment for transaction: {} | pidx: {}",
//                txn.getInternalTxnId(), txn.getExternalTxnId());
//
//        int retryCount = 0;
//        Exception lastException = null;
//
//        while (retryCount < MAX_RETRY_ATTEMPTS) {
//            try {
//                VerifyPaymentRequest verifyPaymentRequest = (VerifyPaymentRequest) request;
//
//                // Validate pidx exists
//                if (txn.getExternalTxnId() == null || txn.getExternalTxnId().isEmpty()) {
//                    return ResponseHandler.failureWildcard("MISSING_PAYMENT_ID",
//                            "No pidx found for this transaction");
//                }
//
//                // Prepare verification payload
//                Map<String, Object> body = Map.of("pidx", txn.getExternalTxnId());
//
//                // Set headers
//                HttpHeaders headers = new HttpHeaders();
//                headers.setContentType(MediaType.APPLICATION_JSON);
//                headers.set("Authorization", "Key " + khaltiConfig.getSecretKey());
//
//                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
//
//                log.debug("Calling Khalti verify API (attempt {}): {} with pidx: {}",
//                        retryCount + 1, khaltiConfig.getVerifyUrl(), txn.getExternalTxnId());
//
//                // Call Khalti verify API
//                ResponseEntity<String> responseEntity = restTemplate.exchange(
//                        khaltiConfig.getVerifyUrl(),
//                        HttpMethod.POST,
//                        entity,
//                        String.class
//                );
//
//                String responseBody = responseEntity.getBody();
//                log.debug("Khalti verification response: {}", responseBody);
//
//                // Parse JSON response
//                Map<String, Object> result = objectMapper.readValue(responseBody, Map.class);
//
//                // Extract payment status
//                String status = (String) result.get("status");
//
//                log.info("Khalti payment status: {} for transaction: {}", status, txn.getInternalTxnId());
//
//                // Handle different statuses
//                if (KHALTI_STATUS_COMPLETED.equalsIgnoreCase(status)) {
//                    return buildSuccessResponse(txn, result);
//                } else if (KHALTI_STATUS_PENDING.equalsIgnoreCase(status)) {
//                    return buildPendingResponse(txn, result);
//                } else if (KHALTI_STATUS_REFUNDED.equalsIgnoreCase(status)) {
//                    return buildRefundedResponse(txn, result);
//                } else if (KHALTI_STATUS_EXPIRED.equalsIgnoreCase(status)) {
//                    return buildExpiredResponse(txn, result);
//                } else {
//                    return buildFailureResponse(txn, result, status);
//                }
//
//            } catch (HttpClientErrorException | HttpServerErrorException e) {
//                lastException = e;
//                log.warn("HTTP error during Khalti verification - Attempt: {}, Status: {}",
//                        retryCount + 1, e.getStatusCode());
//
//                if (e.getStatusCode().is4xxClientError()) {
//                    // Don't retry for client errors
//                    String errorMessage = extractKhaltiErrorMessage(e.getResponseBodyAsString());
//                    return ResponseHandler.error("KHALTI_VERIFICATION_ERROR",
//                            "Failed to verify payment: " + errorMessage,
//                            HttpStatus.BAD_REQUEST);
//                }
//
//                retryCount++;
//                if (retryCount < MAX_RETRY_ATTEMPTS) {
//                    sleep(1000 * retryCount); // Exponential backoff
//                }
//
//            } catch (ClassCastException e) {
//                log.error("Invalid request type for Khalti verification", e);
//                return ResponseHandler.failureWildcard("INVALID_REQUEST",
//                        "Expected VerifyPaymentRequest");
//
//            } catch (Exception e) {
//                lastException = e;
//                log.error("Error verifying Khalti payment - Attempt: {}", retryCount + 1, e);
//
//                retryCount++;
//                if (retryCount < MAX_RETRY_ATTEMPTS) {
//                    sleep(1000 * retryCount);
//                }
//            }
//        }
//
//        // All retries exhausted
//        log.error("All Khalti verification attempts failed for transaction: {}",
//                txn.getInternalTxnId());
//
//        return ResponseHandler.error("VERIFICATION_FAILED",
//                "Failed to verify payment after " + MAX_RETRY_ATTEMPTS + " attempts. " +
//                        "Error: " + (lastException != null ? lastException.getMessage() : "Unknown error"),
//                HttpStatus.BAD_GATEWAY);
//    }
//
//    // Helper methods
//
//    private void validatePaymentRequest(InitiatePaymentRequest request, PaymentTransaction txn) {
//        if (request.getAmount() <= 0) {
//            throw new IllegalArgumentException("Amount must be greater than 0");
//        }
//
//        if (request.getAmount() > khaltiConfig.getMaxAmount()) {
//            throw new IllegalArgumentException(
//                    String.format("Amount exceeds maximum limit of NPR %.2f", khaltiConfig.getMaxAmount())
//            );
//        }
//
//        if (request.getSuccessUrl() == null || request.getSuccessUrl().isEmpty()) {
//            throw new IllegalArgumentException("Success URL is required");
//        }
//    }
//
//    private Response buildSuccessResponse(PaymentTransaction txn,
//                                                           Map<String, Object> khaltiResponse) {
//        // Extract payment details
//        Integer amountInPaisa = (Integer) khaltiResponse.get("total_amount");
//        Double amountInRs = amountInPaisa != null ? amountInPaisa / 100.0 : txn.getAmount().doubleValue();
//
//        String transactionId = (String) khaltiResponse.get("transaction_id");
//
//        // Prepare success response data
//        Map<String, Object> responseData = new HashMap<>();
//        responseData.put("transactionId", txn.getInternalTxnId());
//        responseData.put("pidx", txn.getExternalTxnId());
//        responseData.put("khaltiTransactionId", transactionId);
//        responseData.put("amount", amountInRs);
//        responseData.put("status", "COMPLETED");
//        responseData.put("fee", khaltiResponse.get("fee"));
//        responseData.put("refunded", khaltiResponse.get("refunded"));
//
//        // Build success response
//        PaymentResponse paymentResponse = PaymentResponse.builder()
//                .status("SUCCESS")
//                .message("Payment verified successfully")
//                .data(responseData)
//                .transactionId(txn.getInternalTxnId())
//                .amount(BigDecimal.valueOf(amountInRs))
//                .build();
//
//        log.info("Khalti payment verified successfully: {} | Amount: NPR {} | Khalti TxnId: {}",
//                txn.getInternalTxnId(), amountInRs, transactionId);
//
//        return ResponseHandler.successWildcard("Payment verified successfully", paymentResponse);
//    }
//
//    private Response buildPendingResponse(PaymentTransaction txn,
//                                                           Map<String, Object> khaltiResponse) {
//        Map<String, Object> responseData = new HashMap<>();
//        responseData.put("transactionId", txn.getInternalTxnId());
//        responseData.put("pidx", txn.getExternalTxnId());
//        responseData.put("status", "PENDING");
//        responseData.put("message", "Payment is being processed");
//
//        PaymentResponse paymentResponse = PaymentResponse.builder()
//                .status("PENDING")
//                .message("Payment is being processed")
//                .data(responseData)
//                .transactionId(txn.getInternalTxnId())
//                .amount(BigDecimal.valueOf(txn.getAmount().doubleValue()))
//                .build();
//
//        log.info("Khalti payment pending: {}", txn.getInternalTxnId());
//
//        return ResponseHandler.successWildcard("Payment is pending", paymentResponse);
//    }
//
//    private Response buildRefundedResponse(PaymentTransaction txn,
//                                                            Map<String, Object> khaltiResponse) {
//        Map<String, Object> responseData = new HashMap<>();
//        responseData.put("transactionId", txn.getInternalTxnId());
//        responseData.put("pidx", txn.getExternalTxnId());
//        responseData.put("status", "REFUNDED");
//        responseData.put("refunded", khaltiResponse.get("refunded"));
//
//        PaymentResponse paymentResponse = PaymentResponse.builder()
//                .status("REFUNDED")
//                .message("Payment has been refunded")
//                .data(responseData)
//                .transactionId(txn.getInternalTxnId())
//                .amount(BigDecimal.valueOf(txn.getAmount().doubleValue()))
//                .build();
//
//        log.info("Khalti payment refunded: {}", txn.getInternalTxnId());
//
//        return ResponseHandler.failureWildcard("PAYMENT_REFUNDED", "Payment has been refunded");
//    }
//
//    private Response buildExpiredResponse(PaymentTransaction txn,
//                                                           Map<String, Object> khaltiResponse) {
//        Map<String, Object> responseData = new HashMap<>();
//        responseData.put("transactionId", txn.getInternalTxnId());
//        responseData.put("pidx", txn.getExternalTxnId());
//        responseData.put("status", "EXPIRED");
//
//        PaymentResponse paymentResponse = PaymentResponse.builder()
//                .status("EXPIRED")
//                .message("Payment has expired")
//                .data(responseData)
//                .transactionId(txn.getInternalTxnId())
//                .amount(BigDecimal.valueOf(txn.getAmount().doubleValue()))
//                .build();
//
//        log.warn("Khalti payment expired: {}", txn.getInternalTxnId());
//
//        return ResponseHandler.failureWildcard("PAYMENT_EXPIRED", "Payment has expired");
//    }
//
//    private Response buildFailureResponse(PaymentTransaction txn,
//                                                           Map<String, Object> khaltiResponse,
//                                                           String status) {
//        Map<String, Object> responseData = new HashMap<>();
//        responseData.put("transactionId", txn.getInternalTxnId());
//        responseData.put("pidx", txn.getExternalTxnId());
//        responseData.put("status", status);
//        responseData.put("khaltiResponse", khaltiResponse);
//
//        PaymentResponse paymentResponse = PaymentResponse.builder()
//                .status("FAILED")
//                .message("Payment verification failed")
//                .data(responseData)
//                .transactionId(txn.getInternalTxnId())
//                .amount(BigDecimal.valueOf(txn.getAmount().doubleValue()))
//                .build();
//
//        log.warn("Khalti payment verification failed: {} | Status: {}",
//                txn.getInternalTxnId(), status);
//
//        return ResponseHandler.failureWildcard("PAYMENT_FAILED",
//                "Khalti payment status: " + status);
//    }
//
//    private String extractKhaltiErrorMessage(String errorResponse) {
//        try {
//            Map<String, Object> errorMap = objectMapper.readValue(errorResponse, Map.class);
//            if (errorMap.containsKey("detail")) {
//                return (String) errorMap.get("detail");
//            }
//            if (errorMap.containsKey("message")) {
//                return (String) errorMap.get("message");
//            }
//            return errorResponse;
//        } catch (Exception e) {
//            return "Unknown error occurred";
//        }
//    }
//
//    private void sleep(long milliseconds) {
//        try {
//            Thread.sleep(milliseconds);
//        } catch (InterruptedException e) {
//            Thread.currentThread().interrupt();
//            log.warn("Sleep interrupted", e);
//        }
//    }
//}