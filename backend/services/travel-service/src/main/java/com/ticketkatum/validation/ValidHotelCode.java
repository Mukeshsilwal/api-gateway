package com.ticketkatum.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Validation annotation for hotel code format
 * Hotel code must be 6-10 uppercase alphanumeric characters
 */
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = HotelCodeValidator.class)
@Documented
public @interface ValidHotelCode {

    String message() default "Hotel code must be 3-20 uppercase alphanumeric characters (hyphens/underscores allowed)";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
