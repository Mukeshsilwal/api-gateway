package com.ticketkatum.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

/**
 * Request DTO for creating or updating a room
 * Enhanced with comprehensive validation
 * FIXED: Now matches Room entity structure
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateRoomRequest {

    @NotBlank(message = "Room number is required")
    @Size(min = 1, max = 10, message = "Room number must be between 1 and 10 characters")
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "Room number must contain only uppercase letters, numbers, and hyphens")
    private String roomNumber;

    private String roomType;

    // FIXED: Renamed from pricePerNight to basePrice to match Room entity
    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.01", message = "Base price must be greater than 0")
    @DecimalMax(value = "999999.99", message = "Base price must not exceed 999999.99")
    @Digits(integer = 6, fraction = 2, message = "Base price must have at most 6 digits and 2 decimal places")
    private BigDecimal basePrice;

    // ADDED: maxPrice field to match Room entity
    @DecimalMin(value = "0.01", message = "Max price must be greater than 0")
    @DecimalMax(value = "999999.99", message = "Max price must not exceed 999999.99")
    @Digits(integer = 6, fraction = 2, message = "Max price must have at most 6 digits and 2 decimal places")
    private BigDecimal maxPrice;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 20, message = "Capacity must not exceed 20")
    private Integer capacity;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Active status is required")
    private Boolean active;

    // ADDED: amenities field to match Room entity's Set<String> amenities
    @Size(max = 20, message = "Maximum 20 amenities allowed")
    @Builder.Default
    private Set<@NotBlank(message = "Amenity name cannot be blank") String> amenities = new HashSet<>();

    // REMOVED: imageUrl field (not used in Room entity)
}
