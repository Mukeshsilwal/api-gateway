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
public class MovieRecommendation {
    private Long movieId;
    private String title;
    private String description;
    private String genre;
    private Integer duration; // in minutes
    private String rating; // PG, PG-13, R, etc.
    private Double imdbRating;
    private String language;
    private String releaseDate;
    private String posterUrl;
    private String trailerUrl;
    private List<String> cast;
    private List<String> directors;
    private List<ShowtimeInfo> showtimes;
    private Double distanceKm;
    private String theaterName;
    private String theaterAddress;
}

