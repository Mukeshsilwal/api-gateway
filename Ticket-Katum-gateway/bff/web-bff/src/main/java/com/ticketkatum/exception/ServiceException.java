package com.ticketkatum.exception;

public class ServiceException extends RuntimeException {
    private String errorMessage;

    public ServiceException(String errorMessage) {
        super(String.format("%s", errorMessage));
    }
}
