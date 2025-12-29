package com.ticketkatum.market.events;

import com.ticketkatum.market.domain.PollStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PollCreatedEvent {
    private String eventId;
    private Instant timestamp;
    private Long pollId;
    private Long eventIdRef;
    private String question;
    private PollStatus status;
}
