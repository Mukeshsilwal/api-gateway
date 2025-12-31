package com.ticketkatum.repository;

import com.ticketkatum.entity.EventReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventReminderRepository extends JpaRepository<EventReminder, Long> {

    List<EventReminder> findByEventId(Long eventId);

    List<EventReminder> findByStatusAndScheduledForBefore(
            EventReminder.Status status,
            LocalDateTime time);

    List<EventReminder> findByAttendeeId(Long attendeeId);
}
