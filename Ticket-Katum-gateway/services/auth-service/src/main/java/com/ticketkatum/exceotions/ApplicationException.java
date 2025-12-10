package com.ticketkatum.exceotions;


/**
 * Base exception for all application exceptions
 */
public class ApplicationException extends RuntimeException {
    private final String errorCode;
    private final Object[] args;

    public ApplicationException(String message) {
        super(message);
        this.errorCode = "APP_ERROR";
        this.args = new Object[0];
    }

    public ApplicationException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "APP_ERROR";
        this.args = new Object[0];
    }

    public ApplicationException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.args = new Object[0];
    }

    public ApplicationException(String errorCode, String message, Object... args) {
        super(message);
        this.errorCode = errorCode;
        this.args = args;
    }

    public ApplicationException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.args = new Object[0];
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Object[] getArgs() {
        return args;
    }
}
