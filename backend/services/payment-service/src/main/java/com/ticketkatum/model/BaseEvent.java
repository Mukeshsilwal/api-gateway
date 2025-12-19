package com.ticketkatum.model;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public abstract class BaseEvent {
    private String eventId = UUID.randomUUID().toString();
    private String eventType;
    private Instant occurredAt = Instant.now();
}
