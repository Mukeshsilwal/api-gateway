package com.ticketkatum.model;

import com.ticketkatum.validation.ValidHotelCode;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Request DTO for creating or updating a hotel
 * Enhanced with comprehensive validation
 * FIXED: Now matches Hotel entity structure
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateHotelRequest {

    @NotBlank(message = "Hotel name is required")
    @Size(min = 3, max = 100, message = "Hotel name must be between 3 and 100 characters")
    private String name;

    @NotBlank(message = "Hotel code is required")
    @ValidHotelCode
    private String hotelCode;

    private String phone;
    private String email;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 50, message = "City must be between 2 and 50 characters")
    private String city;

    @NotBlank(message = "Address is required")
    @Size(max = 200, message = "Address must not exceed 200 characters")
    private String address;

    @NotNull(message = "Stars rating is required")
    @Min(value = 1, message = "Stars must be at least 1")
    @Max(value = 5, message = "Stars must not exceed 5")
    private Integer stars;

    // FIXED: Replaced pricePerNight with minPrice/maxPrice to match Hotel entity
    @DecimalMin(value = "0.01", message = "Min price must be greater than 0")
    @DecimalMax(value = "999999.99", message = "Min price must not exceed 999999.99")
    @Digits(integer = 6, fraction = 2, message = "Min price must have at most 6 digits and 2 decimal places")
    private BigDecimal minPrice;

    @DecimalMin(value = "0.01", message = "Max price must be greater than 0")
    @DecimalMax(value = "999999.99", message = "Max price must not exceed 999999.99")
    @Digits(integer = 6, fraction = 2, message = "Max price must have at most 6 digits and 2 decimal places")
    private BigDecimal maxPrice;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String contactEmail;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format (E.164)")
    private String contactPhone;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 20, message = "Maximum 20 amenities allowed")
    private List<@NotBlank(message = "Amenity name cannot be blank") String> amenities;

    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    @Pattern(regexp = "^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*/?$", message = "Invalid image URL format")
    private String imageUrl;

    // FIXED: Changed from BigDecimal to Double to match Hotel entity
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    // ADDED: images field to match Hotel entity's Set<String> images
    @Size(max = 10, message = "Maximum 10 images allowed")
    @Builder.Default
    private Set<@Pattern(regexp = "^https?://.*", message = "Invalid image URL") String> images = new HashSet<>();

    // ADDED: Additional fields from Hotel entity
    private String country;
    private String zipCode;
    private String website;
    private Double rating;
    private Boolean featured;
}