package com.ticketkatum.dto;

import com.ticketkatum.dto.payment.response.PaymentProvider;

import java.util.List;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class CompleteHomePageData {
    private HomePageData hotelData;
    private Long onlineUserCount;
    private List<PaymentProvider> paymentProviders;
    private boolean isAuthenticated;
}