package com.ticketkatum.exception;

public class TokenExpiredException extends AuthServiceException {
    public TokenExpiredException() {
        super("Token has expired");
    }

    public TokenExpiredException(String token, String s) {
        super("Token has expired");
    }
}
