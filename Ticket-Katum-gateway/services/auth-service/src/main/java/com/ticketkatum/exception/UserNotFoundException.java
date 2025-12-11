package com.ticketkatum.exception;

import lombok.Getter;

@Getter
public class UserNotFoundException extends AuthServiceException {
    private final String username;

    public UserNotFoundException(String username) {
        super(String.format("User not found: %s", username));
        this.username = username;
    }
}
