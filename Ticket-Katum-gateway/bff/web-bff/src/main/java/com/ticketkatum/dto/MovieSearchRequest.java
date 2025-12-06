package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieSearchRequest {
    private String query;
    private String genre;
    private Double latitude;
    private Double longitude;
    private Double radiusKm;
    private String date;
    private Integer page;
    private Integer limit;
}
