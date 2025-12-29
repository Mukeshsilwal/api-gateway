package com.ticketkatum.utils;

import com.ticketkatum.exception.InvalidHotelDataException;
import com.ticketkatum.exception.InvalidRoomDataException;
import lombok.experimental.UtilityClass;

import java.math.BigDecimal;
import java.util.regex.Pattern;

/**
 * Utility class for business validation logic
 */
@UtilityClass
public class ValidationUtils {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "^[+]?[0-9]{10,15}$");

    /**
     * Validate email format
     */
    public static void validateEmail(String email) {
        if (email != null && !email.isEmpty() && !EMAIL_PATTERN.matcher(email).matches()) {
            throw new InvalidHotelDataException("Invalid email format: " + email);
        }
    }

    /**
     * Validate phone number format
     */
    public static void validatePhoneNumber(String phone) {
        if (phone != null && !phone.isEmpty() && !PHONE_PATTERN.matcher(phone).matches()) {
            throw new InvalidHotelDataException("Invalid phone number format: " + phone);
        }
    }

    /**
     * Validate latitude range (-90 to 90)
     */
    public static void validateLatitude(Double latitude) {
        if (latitude == null) {
            throw new InvalidHotelDataException("Latitude is required");
        }
        if (latitude < -90.0 || latitude > 90.0) {
            throw new InvalidHotelDataException(
                    String.format("Latitude must be between -90 and 90, got: %.6f", latitude));
        }
    }

    /**
     * Validate longitude range (-180 to 180)
     */
    public static void validateLongitude(Double longitude) {
        if (longitude == null) {
            throw new InvalidHotelDataException("Longitude is required");
        }
        if (longitude < -180.0 || longitude > 180.0) {
            throw new InvalidHotelDataException(
                    String.format("Longitude must be between -180 and 180, got: %.6f", longitude));
        }
    }

    /**
     * Validate star rating (1-5)
     */
    public static void validateStarRating(Integer stars) {
        if (stars != null && (stars < 1 || stars > 5)) {
            throw new InvalidHotelDataException(
                    String.format("Star rating must be between 1 and 5, got: %d", stars));
        }
    }

    /**
     * Validate price range (basePrice <= maxPrice, both > 0)
     */
    public static void validatePriceRange(BigDecimal basePrice, BigDecimal maxPrice) {
        if (basePrice == null) {
            throw new InvalidRoomDataException("Base price is required");
        }

        if (basePrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidRoomDataException(
                    "basePrice", basePrice, "Base price must be greater than 0");
        }

        if (maxPrice != null) {
            if (maxPrice.compareTo(BigDecimal.ZERO) <= 0) {
                throw new InvalidRoomDataException(
                        "maxPrice", maxPrice, "Max price must be greater than 0");
            }

            if (basePrice.compareTo(maxPrice) > 0) {
                throw new InvalidRoomDataException(
                        String.format("Base price (%.2f) cannot be greater than max price (%.2f)",
                                basePrice, maxPrice));
            }
        }
    }

    /**
     * Validate room capacity (> 0 and <= 10)
     */
    public static void validateCapacity(Integer capacity) {
        if (capacity == null) {
            throw new InvalidRoomDataException("Capacity is required");
        }

        if (capacity <= 0) {
            throw new InvalidRoomDataException(
                    "capacity", capacity, "Capacity must be greater than 0");
        }

        if (capacity > 10) {
            throw new InvalidRoomDataException(
                    "capacity", capacity, "Capacity cannot exceed 10 persons");
        }
    }

    /**
     * Validate required string field
     */
    public static void validateRequiredField(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new InvalidRoomDataException(fieldName + " is required");
        }
    }

    /**
     * Validate hotel code format (alphanumeric, 3-20 characters)
     */
    public static void validateHotelCode(String hotelCode) {
        validateRequiredField(hotelCode, "Hotel code");

        if (hotelCode.length() < 3 || hotelCode.length() > 20) {
            throw new InvalidHotelDataException(
                    "Hotel code must be between 3 and 20 characters, got: " + hotelCode.length());
        }

        if (!hotelCode.matches("^[A-Za-z0-9_-]+$")) {
            throw new InvalidHotelDataException(
                    "Hotel code can only contain letters, numbers, hyphens, and underscores");
        }
    }

    /**
     * Validate room number format
     */
    public static void validateRoomNumber(String roomNumber) {
        validateRequiredField(roomNumber, "Room number");

        if (roomNumber.length() > 20) {
            throw new InvalidRoomDataException(
                    "roomNumber", roomNumber, "Room number cannot exceed 20 characters");
        }
    }
}
