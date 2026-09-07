package com.ticketkatum.dto.hotel.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateHotelRequest {

    @NotBlank(message = "Hotel name is required")
    private String name;

    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String country;

    private String hotelCode;

    // Contact info
    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number")
    private String phone;

    // Rating
    @Min(value = 1, message = "Stars must be between 1 and 5")
    @Max(value = 5, message = "Stars must be between 1 and 5")
    private Integer stars;

    @DecimalMin(value = "0.0", message = "Rating must be between 0 and 5")
    @DecimalMax(value = "5.0", message = "Rating must be between 0 and 5")
    private Double rating;

    // Images - can accept both formats
    private Set<String> images; // Multiple images as array
    private String hotelImageUrl; // Single image URL (legacy support)

    // Location (optional for now, can be added later)
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    // Pricing
    private java.math.BigDecimal minPrice;
    private java.math.BigDecimal maxPrice;

    // Additional fields
    private String zipCode;
    private String website;
    private List<String> amenities;
    private Boolean featured;

    // Helper method to get all images (combines both fields)
    public List<String> getAllImages() {
        List<String> allImages = new java.util.ArrayList<>();

        // Add images from array
        if (images != null && !images.isEmpty()) {
            allImages.addAll(images);
        }

        // Add single image URL if provided
        if (hotelImageUrl != null && !hotelImageUrl.isEmpty()) {
            allImages.add(hotelImageUrl);
        }

        return allImages;
    }
}