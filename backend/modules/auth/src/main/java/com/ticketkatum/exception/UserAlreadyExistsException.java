package com.ticketkatum.exception;

import lombok.Getter;

@Getter
public class UserAlreadyExistsException extends AuthServiceException {
    private final String username;

    public UserAlreadyExistsException(String username) {
        super(String.format("User already exists: %s", username));
        this.username = username;
    }
}
