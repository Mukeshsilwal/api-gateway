package com.ticketkatum.service;

import com.ticketkatum.model.PaymentData;

public interface PaymentService {
    PaymentData decodePaymentSignature(String paymentRequest);
}
