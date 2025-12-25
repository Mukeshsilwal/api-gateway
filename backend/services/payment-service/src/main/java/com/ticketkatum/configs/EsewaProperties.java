package com.ticketkatum.configs;

import com.ticketkatum.common.service.SystemConfigService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Getter
@Setter
@Component
@RequiredArgsConstructor
public class EsewaProperties {

    private final SystemConfigService systemConfigService;

    private String merchantCode;
    private String successUrl;
    private String failureUrl;
    private String baseUrl;
    private String verifyUrl;
    private String secretKey;

    @PostConstruct
    public void init() {
        this.merchantCode = systemConfigService.getString("ESEWA_MERCHANT_CODE", "EPAYTEST");
        this.secretKey = systemConfigService.getString("ESEWA_SECRET_KEY", "8gBm/:&EnhH.1/q");
        this.baseUrl = systemConfigService.getString("ESEWA_BASE_URL",
                "https://rc-epay.esewa.com.np/api/epay/main/v2/form");
        this.verifyUrl = systemConfigService.getString("ESEWA_VERIFY_URL",
                "https://rc-epay.esewa.com.np/api/epay/transaction/status");

        // URLs for callbacks might be constructed or config based - adding placeholder
        // or simple get
        // Assuming these are also in System Config or fixed relative paths?
        // Let's use get with default or assume they are passed dynamically.
        // For now, I'll default them if not in DB, but I didn't add SUCCESS/FAILURE URL
        // to SQL.
        // I'll leave them as settable or null, but `EsewaPaymentProvider` likely
        // constructs them?
        // Checked EsewaPaymentProvider: it uses getSuccessUrl().
        // I should probably add SUCCESS_URL to DB or hardcode defaults here.
        this.successUrl = systemConfigService.getString("ESEWA_SUCCESS_URL",
                "http://localhost:3000/payments/esewa/success");
        this.failureUrl = systemConfigService.getString("ESEWA_FAILURE_URL",
                "http://localhost:3000/payments/esewa/failure");
    }
}
