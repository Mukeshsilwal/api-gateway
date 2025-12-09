package com.ticketkatum.exceotions;

public class ResourceNotFoundException extends ApplicationException {
    public ResourceNotFoundException(String message) {
        super("RESOURCE_NOT_FOUND", message);
    }

    public ResourceNotFoundException(String resource, String identifier) {
        super("RESOURCE_NOT_FOUND",
                String.format("%s not found with identifier: %s", resource, identifier));
    }
}