package com.ticketkatum.exceotions;

public class UnauthorizedException extends ApplicationException {
    public UnauthorizedException(String message) {
        super("UNAUTHORIZED", message);
    }
}