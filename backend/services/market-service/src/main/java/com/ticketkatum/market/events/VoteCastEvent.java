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
public class VoteCastEvent {
    private String eventId;
    private Instant timestamp;
    private long pollId;
    private String selectedOption;
}
