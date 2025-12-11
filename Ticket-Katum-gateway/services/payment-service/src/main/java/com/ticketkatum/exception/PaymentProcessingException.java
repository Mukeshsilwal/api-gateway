package com.ticketkatum.exception;

import lombok.Getter;

/**
 * Exception thrown when payment processing fails
 */
@Getter
public class PaymentProcessingException extends PaymentServiceException {

    private final String provider;
    private final String errorCode;

    public PaymentProcessingException(String message, String provider, String errorCode) {
        super(message);
        this.provider = provider;
        this.errorCode = errorCode;
    }

    public PaymentProcessingException(String message, String provider) {
        this(message, provider, null);
    }
}
