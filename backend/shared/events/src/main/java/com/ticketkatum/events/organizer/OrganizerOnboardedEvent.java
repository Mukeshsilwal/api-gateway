package com.ticketkatum.events.organizer;

import com.ticketkatum.events.base.BaseEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

/**
 * Event published when a new organizer is successfully onboarded.
 * Event Type: events.organizer.onboarded.v1
 */
@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class OrganizerOnboardedEvent extends BaseEvent {

    public static final String EVENT_TYPE = "events.organizer.onboarded.v1";

    private OrganizerOnboardedPayload payload;

    public OrganizerOnboardedEvent(OrganizerOnboardedPayload payload) {
        this.payload = payload;
        initializeBaseFields(EVENT_TYPE);
    }

    @Override
    public Object getPayload() {
        return payload;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizerOnboardedPayload {
        private Long organizerId;
        private String email;
        private String companyName;
        private String contactPerson;
        private String phoneNumber;
        private String verificationStatus; // PENDING, VERIFIED, REJECTED
        private Instant createdAt;
        private String country;
        private String businessType; // INDIVIDUAL, COMPANY, NON_PROFIT
    }
}
