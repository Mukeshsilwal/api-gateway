package com.ticketkatum.exception;

public class ServiceClientException extends RuntimeException {
    private final String serviceName;
    private final String errorCode;
    private final int httpStatus;

    public ServiceClientException(String message) {
        super(message);
        this.serviceName = "UNKNOWN";
        this.errorCode = "SERVICE_ERROR";
        this.httpStatus = 500;
    }

    public ServiceClientException(String message, Throwable cause) {
        super(message, cause);
        this.serviceName = "UNKNOWN";
        this.errorCode = "SERVICE_ERROR";
        this.httpStatus = 500;
    }

    public ServiceClientException(String message, String serviceName, int httpStatus) {
        super(message);
        this.serviceName = serviceName;
        this.errorCode = "SERVICE_ERROR";
        this.httpStatus = httpStatus;
    }

    public ServiceClientException(String message, Throwable cause, String serviceName, int httpStatus) {
        super(message, cause);
        this.serviceName = serviceName;
        this.errorCode = "SERVICE_ERROR";
        this.httpStatus = httpStatus;
    }

    public String getServiceName() {
        return serviceName;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public int getHttpStatus() {
        return httpStatus;
    }
}