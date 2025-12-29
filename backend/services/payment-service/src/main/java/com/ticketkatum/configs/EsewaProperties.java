package com.ticketkatum.configs;

import com.ticketkatum.common.service.SystemConfigService;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@RequiredArgsConstructor
public class EsewaProperties {

        @Autowired(required = false)
        private SystemConfigService systemConfigService;

        private String merchantCode;
        private String successUrl;
        private String failureUrl;
        private String baseUrl;
        private String verifyUrl;
        private String secretKey;

        @PostConstruct
        public void init() {
                if (systemConfigService != null) {
                        this.merchantCode = systemConfigService.getString("ESEWA_MERCHANT_CODE", "EPAYTEST");
                        this.secretKey = systemConfigService.getString("ESEWA_SECRET_KEY", "8gBm/:&EnhH.1/q");
                        this.baseUrl = systemConfigService.getString("ESEWA_BASE_URL",
                                        "https://rc-epay.esewa.com.np/api/epay/main/v2/form");
                        this.verifyUrl = systemConfigService.getString("ESEWA_VERIFY_URL",
                                        "https://rc-epay.esewa.com.np/api/epay/transaction/status");
                        this.successUrl = systemConfigService.getString("ESEWA_SUCCESS_URL",
                                        "http://localhost:3000/payments/esewa/success");
                        this.failureUrl = systemConfigService.getString("ESEWA_FAILURE_URL",
                                        "http://localhost:3000/payments/esewa/failure");
                } else {
                        // Fallback to hardcoded defaults when SystemConfigService is not available
                        this.merchantCode = "EPAYTEST";
                        this.secretKey = "8gBm/:&EnhH.1/q";
                        this.baseUrl = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
                        this.verifyUrl = "https://rc-epay.esewa.com.np/api/epay/transaction/status";
                        this.successUrl = "http://localhost:3000/payments/esewa/success";
                        this.failureUrl = "http://localhost:3000/payments/esewa/failure";
                }
        }
}
