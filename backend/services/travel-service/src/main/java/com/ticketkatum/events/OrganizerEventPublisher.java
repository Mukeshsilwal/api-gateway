package com.ticketkatum.events;

import com.ticketkatum.events.organizer.OrganizerOnboardedEvent;
import com.ticketkatum.events.publisher.EventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Publisher for organizer-related events.
 * Handles publishing of organizer onboarding events to Kafka.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrganizerEventPublisher {

    private final EventPublisher eventPublisher;

    /**
     * Publish organizer onboarded event.
     * 
     * @param organizerId ID of the onboarded organizer
     * @param email Organizer email
     * @param companyName Company name
     * @param contactPerson Contact person name
     * @param phoneNumber Phone number
     * @param verificationStatus Verification status (PENDING, VERIFIED, REJECTED)
     * @param country Country
     * @param businessType Business type (INDIVIDUAL, COMPANY, NON_PROFIT)
     */
    public void publishOrganizerOnboarded(
            Long organizerId,
            String email,
            String companyName,
            String contactPerson,
            String phoneNumber,
            String verificationStatus,
            String country,
            String businessType) {
        
        log.info("Publishing organizer onboarded event for organizerId: {}", organizerId);
        
        OrganizerOnboardedEvent.OrganizerOnboardedPayload payload = 
            OrganizerOnboardedEvent.OrganizerOnboardedPayload.builder()
                .organizerId(organizerId)
                .email(email)
                .companyName(companyName)
                .contactPerson(contactPerson)
                .phoneNumber(phoneNumber)
                .verificationStatus(verificationStatus)
                .createdAt(Instant.now())
                .country(country)
                .businessType(businessType)
                .build();
        
        OrganizerOnboardedEvent event = new OrganizerOnboardedEvent(payload);
        event.setCausedBy("event-service");
        
        // Use organizerId as partition key for ordering
        eventPublisher.publishEvent(event, organizerId.toString());
        
        log.info("Organizer onboarded event published: eventId={}, organizerId={}", 
                event.getEventId(), organizerId);
    }
}
