package com.ticketkatum.exceotions;


public class ServiceException extends ApplicationException {
    private final String serviceName;

    public ServiceException(String message) {
        super("SERVICE_ERROR", message);
        this.serviceName = "UNKNOWN";
    }

    public ServiceException(String serviceName, String message) {
        super("SERVICE_ERROR", message);
        this.serviceName = serviceName;
    }

    public ServiceException(String message, Throwable cause) {
        super("SERVICE_ERROR", message, cause);
        this.serviceName = "UNKNOWN";
    }

    public String getServiceName() {
        return serviceName;
    }
}
