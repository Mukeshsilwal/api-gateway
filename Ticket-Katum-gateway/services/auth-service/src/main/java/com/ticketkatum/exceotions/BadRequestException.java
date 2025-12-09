package com.ticketkatum.exceotions;


public class BadRequestException extends ApplicationException {
    public BadRequestException(String message) {
        super("BAD_REQUEST", message);
    }

    public BadRequestException(String message, Object... args) {
        super("BAD_REQUEST", message, args);
    }
}