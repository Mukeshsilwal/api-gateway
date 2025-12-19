package com.ticketkatum.utils;

import lombok.experimental.UtilityClass;

import java.util.Collection;
import java.util.regex.Pattern;

@UtilityClass
public class ValidationUtils {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$");

    /**
     * Validates that a string is not null or empty
     */
    public static void requireNonEmpty(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " cannot be null or empty");
        }
    }

    /**
     * Validates that an object is not null
     */
    public static void requireNonNull(Object value, String fieldName) {
        if (value == null) {
            throw new IllegalArgumentException(fieldName + " cannot be null");
        }
    }

    /**
     * Validates that a collection is not null or empty
     */
    public static void requireNonEmpty(Collection<?> collection, String fieldName) {
        if (collection == null || collection.isEmpty()) {
            throw new IllegalArgumentException(fieldName + " cannot be null or empty");
        }
    }

    /**
     * Validates email format
     */
    public static void validateEmail(String email) {
        requireNonEmpty(email, "Email");
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }

    /**
     * Validates password strength
     * - At least 8 characters
     * - At least one digit
     * - At least one lowercase letter
     * - At least one uppercase letter
     * - At least one special character
     */
    public static void validatePasswordStrength(String password) {
        requireNonEmpty(password, "Password");
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException(
                    "Password must be at least 8 characters long and contain at least one digit, " +
                            "one lowercase letter, one uppercase letter, and one special character");
        }
    }

    /**
     * Validates that a number is positive
     */
    public static void requirePositive(Number value, String fieldName) {
        requireNonNull(value, fieldName);
        if (value.doubleValue() <= 0) {
            throw new IllegalArgumentException(fieldName + " must be positive");
        }
    }

    /**
     * Validates that passwords match
     */
    public static void requirePasswordsMatch(String password, String confirmPassword) {
        requireNonEmpty(password, "Password");
        requireNonEmpty(confirmPassword, "Confirm Password");
        if (!password.equals(confirmPassword)) {
            throw new IllegalArgumentException("Passwords do not match");
        }
    }
}
