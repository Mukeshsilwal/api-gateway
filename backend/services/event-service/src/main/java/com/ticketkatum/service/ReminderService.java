package com.ticketkatum.service;

import com.ticketkatum.entity.Attendee;
import com.ticketkatum.entity.EventReminder;
import com.ticketkatum.repository.AttendeeRepository;
import com.ticketkatum.repository.EventReminderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReminderService {

    private final EventReminderRepository reminderRepository;
    private final AttendeeRepository attendeeRepository;

    /**
     * Schedule reminders for event attendees
     */
    @Transactional
    public void scheduleReminders(Long eventId, LocalDateTime eventStartTime) {
        log.info("Scheduling reminders for event: {}", eventId);

        List<Attendee> attendees = attendeeRepository.findByEventId(eventId);

        for (Attendee attendee : attendees) {
            // Schedule 24-hour reminder
            createReminder(attendee, eventStartTime.minusHours(24),
                    EventReminder.ReminderType.ONE_DAY_BEFORE);

            // Schedule 1-hour reminder
            createReminder(attendee, eventStartTime.minusHours(1),
                    EventReminder.ReminderType.ONE_HOUR_BEFORE);
        }

        log.info("Scheduled reminders for {} attendees", attendees.size());
    }

    private void createReminder(Attendee attendee, LocalDateTime scheduledFor,
            EventReminder.ReminderType type) {
        EventReminder reminder = EventReminder.builder()
                .eventId(attendee.getBooking().getEvent().getId())
                .attendeeId(attendee.getId())
                .attendeeEmail(attendee.getEmail())
                .reminderType(type)
                .scheduledFor(scheduledFor)
                .status(EventReminder.Status.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        reminderRepository.save(reminder);
    }

    /**
     * Process pending reminders (runs every 5 minutes)
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    @Transactional
    public void processPendingReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<EventReminder> pendingReminders = reminderRepository
                .findByStatusAndScheduledForBefore(EventReminder.Status.PENDING, now);

        log.info("Processing {} pending reminders", pendingReminders.size());

        for (EventReminder reminder : pendingReminders) {
            try {
                sendReminder(reminder);
                reminder.setStatus(EventReminder.Status.SENT);
                reminder.setSentAt(LocalDateTime.now());
                reminderRepository.save(reminder);
            } catch (Exception e) {
                log.error("Failed to send reminder: {}", reminder.getId(), e);
                reminder.setStatus(EventReminder.Status.FAILED);
                reminderRepository.save(reminder);
            }
        }
    }

    private void sendReminder(EventReminder reminder) {
        // TODO: Implement actual email sending
        log.info("Sending {} reminder to {}",
                reminder.getReminderType(), reminder.getAttendeeEmail());

        // Placeholder for email service integration
        // emailService.sendEventReminder(reminder);
    }

    public List<EventReminder> getRemindersByEvent(Long eventId) {
        return reminderRepository.findByEventId(eventId);
    }
}
