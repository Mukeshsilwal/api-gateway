package com.ticketkatum.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewSummary {
    private String userName;
    private Double rating;
    private String comment;
    private String date;
}

