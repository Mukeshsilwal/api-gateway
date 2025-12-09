package com.ticketkatum.exceotions;

public class DuplicateResourceException extends ApplicationException {
    public DuplicateResourceException(String message) {
        super("DUPLICATE_RESOURCE", message);
    }
}
