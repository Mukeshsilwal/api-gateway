package com.ticketkatum.payment.provider;

import com.ticketkatum.configs.EsewaProperties;
import com.ticketkatum.dto.PaymentVerifiedEvent;
import com.ticketkatum.entity.PaymentTransaction;
import com.ticketkatum.enums.TransactionStatus;
import com.ticketkatum.event.PaymentEventPublisher;
import com.ticketkatum.model.ResponseHandler;
import com.ticketkatum.payment.PaymentProvider;
import com.ticketkatum.payment.request.InitiatePaymentRequest;
import com.ticketkatum.payment.request.PaymentResponse;
import com.ticketkatum.payment.request.VerifyPaymentRequest;
import com.ticketkatum.repository.PaymentTransactionRepository;
import com.ticketkatum.utils.Request;
import com.ticketkatum.utils.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component("esewa")
@RequiredArgsConstructor
public class EsewaPaymentProvider implements PaymentProvider {

    private final EsewaProperties esewaProperties;
    private final RestTemplate restTemplate;
    private final PaymentTransactionRepository txnRepo;
    private final PaymentEventPublisher paymentEventPublisher;

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final int MAX_RETRY_ATTEMPTS = 3;

    @Override
    public Response doPayment(Request request, PaymentTransaction txn) {
        try {
            InitiatePaymentRequest paymentRequest = (InitiatePaymentRequest) request;

            // Calculate amounts
            double amt = paymentRequest.getAmount();
            double taxAmt = 0.0;
            double psc = 0.0; // product_service_charge
            double pdc = 0.0; // product_delivery_charge
            double tAmt = amt + taxAmt + psc + pdc;

            String pid = txn.getInternalTxnId();
            String scd = esewaProperties.getMerchantCode();
            String su = buildCallbackUrl(esewaProperties.getSuccessUrl(), pid);
            String fu = buildCallbackUrl(esewaProperties.getFailureUrl(), pid);

            // V2 API signature format: HMAC_SHA256(total_amount,transaction_uuid,product_code)
            String signature = generateEsewaV2Signature(tAmt, pid, scd, esewaProperties.getSecretKey());

            log.info("eSewa Payment Initiation - Transaction ID: {}, Amount: {}, Signature generated", pid, tAmt);

            // Build HTML auto-submit form for v2 API
            String htmlForm = """
                        <html>
                          <body onload="document.forms[0].submit()">
                            <form action="%s" method="POST">
                              <input type="hidden" name="amount" value="%s"/>
                              <input type="hidden" name="tax_amount" value="%s"/>
                              <input type="hidden" name="total_amount" value="%s"/>
                              <input type="hidden" name="transaction_uuid" value="%s"/>
                              <input type="hidden" name="product_code" value="%s"/>
                              <input type="hidden" name="product_service_charge" value="%s"/>
                              <input type="hidden" name="product_delivery_charge" value="%s"/>
                              <input type="hidden" name="success_url" value="%s"/>
                              <input type="hidden" name="failure_url" value="%s"/>
                              <input type="hidden" name="signed_field_names" value="total_amount,transaction_uuid,product_code"/>
                              <input type="hidden" name="signature" value="%s"/>
                            </form>
                          </body>
                        </html>
                    """.formatted(
                    esewaProperties.getBaseUrl(),
                    trimAmount(amt),
                    trimAmount(taxAmt),
                    trimAmount(tAmt),
                    htmlEscape(pid),
                    htmlEscape(scd),
                    trimAmount(psc),
                    trimAmount(pdc),
                    htmlEscape(su),
                    htmlEscape(fu),
                    htmlEscape(signature)
            );

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("htmlForm", htmlForm);
            responseData.put("transactionId", pid);
            responseData.put("amount", amt);
            responseData.put("totalAmount", tAmt);

            PaymentResponse paymentResponse = PaymentResponse.builder()
                    .status("INITIATED")
                    .message("Payment gateway form generated successfully")
                    .data(responseData)
                    .transactionId(pid)
                    .amount(BigDecimal.valueOf(amt))
                    .build();

            return ResponseHandler.successWildcard("Payment initiated successfully", paymentResponse);

        } catch (Exception e) {
            log.error("Error initiating eSewa payment", e);
            return ResponseHandler.failureWildcard("Payment Initiation Failed", e.getMessage());
        }
    }

    /**
     * Generates eSewa V2 API signature
     * Format: Base64(HMAC_SHA256(secret, "total_amount=X,transaction_uuid=Y,product_code=Z"))
     */
    private String generateEsewaV2Signature(double totalAmount, String transactionUuid, String productCode, String secretKey) throws Exception {
        String amtStr = trimAmount(totalAmount);

        String message = String.format("total_amount=%s,transaction_uuid=%s,product_code=%s",
                amtStr, transactionUuid, productCode);

        log.info("Signature message: {}", message);

        Mac mac = Mac.getInstance(HMAC_SHA256);
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
        mac.init(secretKeySpec);
        byte[] rawHmac = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));

        String signature = Base64.getEncoder().encodeToString(rawHmac);
        log.info("Generated signature: {}", signature);

        return signature;
    }

    /**
     * Ensures numeric formatting is consistent
     */
    private String trimAmount(double value) {
        BigDecimal bd = BigDecimal.valueOf(value).stripTrailingZeros();
        return bd.toPlainString();
    }

    /**
     * Basic HTML escape for values inserted into attributes
     */
    private String htmlEscape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("\"", "&quot;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    @Override
    public Response verifyPayment(Request request, PaymentTransaction txn) {

        try {

            String url = UriComponentsBuilder
                    .fromHttpUrl(esewaProperties.getVerifyUrl())
                    .queryParam("product_code", esewaProperties.getMerchantCode())
                    .queryParam("transaction_uuid", txn.getInternalTxnId())
                    .queryParam("total_amount", trimAmount(txn.getAmount().doubleValue()))
                    .toUriString();

            log.info("Verifying eSewa payment: {}", url);

            ResponseEntity<String> responseEntity =
                    restTemplate.getForEntity(url, String.class);

            VerificationResult result =
                    parseVerificationResponse(responseEntity.getBody());

            if (!result.isSuccess()) {
                return ResponseHandler.failureWildcard(
                        "Payment Verification Failed",
                        result.getFailureReason()
                );
            }


            Map<String, Object> responseData = new HashMap<>();
            responseData.put("transactionId", txn.getInternalTxnId());
            responseData.put("externalTxnId", result.getRefId());
            responseData.put("amount", txn.getAmount());
            responseData.put("status", "SUCCESS");
            responseData.put("verifiedAt", new Date());

            if (result.isSuccess()) {
                this.markSuccess(txn.getInternalTxnId(), result.getRefId());

                paymentEventPublisher.publishPaymentVerified(
                        new PaymentVerifiedEvent(
                                txn.getBookingId(),
                                txn.getInternalTxnId(),
                                txn.getAmount(),
                                "ESEWA",
                                LocalDateTime.now()
                        )
                );
            }

            return ResponseHandler.successWildcard(
                    "Payment verified successfully",
                    responseData
            );

        } catch (Exception e) {
            log.error("eSewa verification error", e);
            return ResponseHandler.failureWildcard(
                    "Payment Verification Error",
                    e.getMessage()
            );
        }
    }

    @Transactional
    public PaymentTransaction markSuccess(
            String internalTxnId,
            String providerTxnId
    ) {

        PaymentTransaction txn = txnRepo.findByInternalTxnId(internalTxnId)
                .orElseThrow(() ->
                        new IllegalStateException("Transaction not found: " + internalTxnId));

        if (txn.getStatus() == TransactionStatus.SUCCESS) {
            log.info("Payment already marked SUCCESS: {}", internalTxnId);
            return txn;
        }

        txn.setStatus(TransactionStatus.SUCCESS);
        txn.setExternalTxnId(providerTxnId);
        txn.setCompletedAt(LocalDateTime.now());

        txnRepo.save(txn);

        log.info("Payment marked SUCCESS for txn {}", internalTxnId);
        return txn;
    }

    private String buildCallbackUrl(String baseUrl, String transactionId) {
        return baseUrl.contains("?") ? baseUrl + "&txnId=" + transactionId : baseUrl + "?txnId=" + transactionId;
    }

    private VerificationResult parseVerificationResponse(String response) {
        VerificationResult result = new VerificationResult();
        result.setRawResponse(response);

        if (response == null || response.isEmpty()) {
            result.setSuccess(false);
            result.setFailureReason("Empty response from gateway");
            return result;
        }

        boolean success = response.toLowerCase().contains("success") ||
                response.toLowerCase().contains("complete") ||
                response.contains("<status>Success</status>") ||
                response.contains("\"status\":\"success\"");

        result.setSuccess(success);
        if (success) result.setRefId(extractRefId(response));
        else result.setFailureReason(extractFailureReason(response));

        return result;
    }

    private String extractRefId(String response) {
        try {
            int idx = response.indexOf("ref_id");
            if (idx == -1) return "N/A";
            int start = idx + 8;
            int end = response.indexOf("\"", start);
            if (end == -1) end = response.length();
            return response.substring(start, end).trim();
        } catch (Exception e) {
            return "N/A";
        }
    }

    private String extractFailureReason(String response) {
        response = response.toLowerCase();
        if (response.contains("insufficient")) return "Insufficient balance";
        if (response.contains("invalid")) return "Invalid transaction or credentials";
        if (response.contains("expired")) return "Transaction expired";
        if (response.contains("cancelled")) return "Cancelled by user";
        return "Payment verification failed";
    }

    private static class VerificationResult {
        private boolean success;
        private String refId;
        private String failureReason;
        private String rawResponse;

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getRefId() {
            return refId;
        }

        public void setRefId(String refId) {
            this.refId = refId;
        }

        public String getFailureReason() {
            return failureReason;
        }

        public void setFailureReason(String failureReason) {
            this.failureReason = failureReason;
        }

        public String getRawResponse() {
            return rawResponse;
        }

        public void setRawResponse(String rawResponse) {
            this.rawResponse = rawResponse;
        }
    }
}