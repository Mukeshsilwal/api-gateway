package com.ticketkatum.dto.hotel.request;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
public class CreateRoomRequest {
    private Long id;
    private String roomNumber;
    private String roomType;
    private String description;
    private Integer capacity;
    private BigDecimal basePrice;
    private BigDecimal maxPrice;
    private Set<String> amenities;
    private Set<String> images;

    // New fields
    private List<PricingConfiguration> pricingConfigurations;
    private Set<String> allowedRentTypes;
    private Set<String> allowedMealPlans;
    private Set<String> allowedMealServices;

    private boolean active;
    private HotelBookingRequest hotel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingConfiguration {
        private String rentType;
        private String mealPlan;
        private String mealService;
        private BigDecimal price;
    }

}
