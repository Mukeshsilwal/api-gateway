package com.ticketkatum.exception;

public class TokenExpiredException extends AuthServiceException {
    public TokenExpiredException() {
        super("Token has expired");
    }
}
