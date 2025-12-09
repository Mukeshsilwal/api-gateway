package com.ticketkatum.exceotions;

public class ValidationException extends ApplicationException {
    private final java.util.Map<String, String> fieldErrors;

    public ValidationException(String message) {
        super("VALIDATION_ERROR", message);
        this.fieldErrors = new java.util.HashMap<>();
    }

    public ValidationException(java.util.Map<String, String> fieldErrors) {
        super("VALIDATION_ERROR", "Validation failed");
        this.fieldErrors = fieldErrors;
    }

    public java.util.Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}
