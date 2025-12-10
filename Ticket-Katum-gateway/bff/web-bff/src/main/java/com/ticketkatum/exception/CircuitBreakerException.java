package com.ticketkatum.exception;

public class CircuitBreakerException extends RuntimeException {
    private final String serviceName;

    public CircuitBreakerException(String serviceName) {
        super(String.format("Service %s is currently unavailable (Circuit Breaker OPEN)", serviceName));
        this.serviceName = serviceName;
    }

    public CircuitBreakerException(String message, String serviceName) {
        super(message);
        this.serviceName = serviceName;
    }

    public String getServiceName() {
        return serviceName;
    }
}
