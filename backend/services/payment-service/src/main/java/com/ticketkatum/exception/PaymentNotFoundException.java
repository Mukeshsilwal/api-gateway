package com.ticketkatum.exception;

import lombok.Getter;

/**
 * Exception thrown when a payment transaction is not found
 */
@Getter
public class PaymentNotFoundException extends PaymentServiceException {

    private final String transactionId;

    public PaymentNotFoundException(String transactionId) {
        super(String.format("Payment not found with transaction ID: %s", transactionId));
        this.transactionId = transactionId;
    }
}
