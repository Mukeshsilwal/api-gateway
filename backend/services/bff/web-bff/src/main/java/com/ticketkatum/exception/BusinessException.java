package com.ticketkatum.exception;

public class BusinessException extends RuntimeException {
    private final String errorCode;
    private final Object[] args;

    public BusinessException(String message) {
        super(message);
        this.errorCode = "BUSINESS_ERROR";
        this.args = null;
    }

    public BusinessException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.args = null;
    }

    public BusinessException(String message, String errorCode, Object... args) {
        super(message);
        this.errorCode = errorCode;
        this.args = args;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Object[] getArgs() {
        return args;
    }
}
