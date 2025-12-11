package com.ticketkatum.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator for hotel code format
 */
public class HotelCodeValidator implements ConstraintValidator<ValidHotelCode, String> {

    private static final String HOTEL_CODE_PATTERN = "^[A-Z0-9]{6,10}$";

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Use @NotNull for null checks
        }

        return value.matches(HOTEL_CODE_PATTERN);
    }
}
