package com.ticketkatum.exception;

public class AggregationException extends RuntimeException {
    private final String errorCode;
    private final Object additionalData;

    public AggregationException(String message) {
        super(message);
        this.errorCode = "AGGREGATION_ERROR";
        this.additionalData = null;
    }

    public AggregationException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "AGGREGATION_ERROR";
        this.additionalData = null;
    }

    public AggregationException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.additionalData = null;
    }

    public AggregationException(String message, String errorCode, Object additionalData) {
        super(message);
        this.errorCode = errorCode;
        this.additionalData = additionalData;
    }

    public AggregationException(String message, Throwable cause, String errorCode) {
        super(message, cause);
        this.errorCode = errorCode;
        this.additionalData = null;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Object getAdditionalData() {
        return additionalData;
    }
}

