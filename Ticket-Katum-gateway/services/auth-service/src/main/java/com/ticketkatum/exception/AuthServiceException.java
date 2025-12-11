package com.ticketkatum.exception;

/**
 * Base exception for all auth service exceptions
 */
public class AuthServiceException extends RuntimeException {

    public AuthServiceException(String message) {
        super(message);
    }

    public AuthServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
