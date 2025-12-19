package com.ticketkatum.exception;

import lombok.Getter;

/**
 * Exception thrown when payment provider is invalid or unsupported
 */
@Getter
public class InvalidPaymentProviderException extends PaymentServiceException {

    private final String provider;

    public InvalidPaymentProviderException(String provider) {
        super(String.format("Invalid or unsupported payment provider: %s", provider));
        this.provider = provider;
    }
}
