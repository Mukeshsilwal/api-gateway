package com.ticketkatum.exception;

public class TimeoutException extends RuntimeException {
    private final String operation;
    private final long timeoutMs;

    public TimeoutException(String operation, long timeoutMs) {
        super(String.format("Operation '%s' timed out after %d ms", operation, timeoutMs));
        this.operation = operation;
        this.timeoutMs = timeoutMs;
    }

    public TimeoutException(String message, String operation, long timeoutMs) {
        super(message);
        this.operation = operation;
        this.timeoutMs = timeoutMs;
    }

    public String getOperation() {
        return operation;
    }

    public long getTimeoutMs() {
        return timeoutMs;
    }
}

