package com.ticketkatum.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class CheckInReminderScheduler {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String HOTEL_EVENTS_TOPIC = "hotel-events";

    /**
     * Check for upcoming check-ins every hour
     * Send reminders 24 hours before check-in time
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour
    public void checkUpcomingCheckIns() {
        log.debug("Checking for upcoming hotel check-ins");

        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime reminderWindow = now.plusHours(24);

            // TODO: Query database for bookings with check-in time in next 24 hours
            // For now, this is a placeholder for the logic

            log.debug("Check-in reminder check completed");
        } catch (Exception e) {
            log.error("Error checking upcoming check-ins", e);
        }
    }

    /**
     * Publish check-in reminder event
     */
    public void publishCheckInReminder(Long bookingId, Long hotelId, String guestName,
            LocalDateTime checkInTime) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("eventType", "hotel.checkin.reminder");
            event.put("bookingId", bookingId);
            event.put("hotelId", hotelId);
            event.put("guestName", guestName);
            event.put("checkInTime", checkInTime);
            event.put("timestamp", LocalDateTime.now());

            kafkaTemplate.send(HOTEL_EVENTS_TOPIC, bookingId.toString(), event);
            log.info("Published check-in reminder for booking: {}", bookingId);
        } catch (Exception e) {
            log.error("Failed to publish check-in reminder", e);
        }
    }
}
