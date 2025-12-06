package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieSearchResponse {
    private List<MovieRecommendation> movies;
    private Integer totalResults;
    private Integer page;
    private Integer totalPages;
    private String message;
}
