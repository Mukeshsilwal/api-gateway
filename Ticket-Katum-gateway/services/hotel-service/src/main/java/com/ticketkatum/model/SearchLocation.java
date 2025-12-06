package com.ticketkatum.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchLocation {
    private Double latitude;
    private Double longitude;
    private String address; // Reverse geocoded address (optional)
    private String city;
    private Double radiusKm;
}