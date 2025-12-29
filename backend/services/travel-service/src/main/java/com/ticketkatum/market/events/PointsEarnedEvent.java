package com.ticketkatum.market.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointsEarnedEvent {
    private String eventId;
    private Instant timestamp;
    private Long transactionId;
    private long userId;
    private int pointsEarned;
    private String source;
    private String description;
}
