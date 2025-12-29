package com.ticketkatum.service;

import com.ticketkatum.entity.Attendee;
import com.ticketkatum.repository.AttendeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Check-in Service
 * Handles attendee check-in
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CheckInService {

    private final AttendeeRepository attendeeRepository;

    /**
     * Check in attendee by QR code
     */
    @Transactional
    public Map<String, Object> checkIn(String qrCode, String checkedInBy, String location) {
        log.info("Processing check-in for QR: {}", qrCode.substring(0, 20));

        Attendee attendee = attendeeRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new RuntimeException("Invalid QR code"));

        Map<String, Object> response = new HashMap<>();
        response.put("ticketId", attendee.getTicketId());
        response.put("attendeeName", attendee.getFullName());
        response.put("ticketType", attendee.getTicketType().getName());
        response.put("eventName", attendee.getBooking().getEvent().getName());

        if (attendee.getCheckInStatus() == Attendee.CheckInStatus.CHECKED_IN) {
            response.put("success", false);
            response.put("alreadyCheckedIn", true);
            response.put("checkInTime", attendee.getCheckedInAt());
            response.put("message", "Ticket already checked in at " + attendee.getCheckedInAt());
            return response;
        }

        if (attendee.getCheckInStatus() == Attendee.CheckInStatus.CANCELLED) {
            response.put("success", false);
            response.put("message", "Ticket has been cancelled");
            return response;
        }

        // Perform check-in
        attendee.setCheckInStatus(Attendee.CheckInStatus.CHECKED_IN);
        attendee.setCheckedInAt(LocalDateTime.now());
        attendee.setCheckedInBy(checkedInBy);
        attendee.setCheckInLocation(location);

        attendeeRepository.save(attendee);

        response.put("success", true);
        response.put("alreadyCheckedIn", false);
        response.put("checkInTime", attendee.getCheckedInAt());
        response.put("message", "Check-in successful");

        log.info("Check-in successful for ticket: {}", attendee.getTicketId());
        return response;
    }

    /**
     * Get check-in statistics for event
     */
    public Map<String, Object> getCheckInStats(Long eventId) {
        log.info("Fetching check-in stats for event: {}", eventId);

        List<Attendee> allAttendees = attendeeRepository.findByEventId(eventId);
        Long checkedInCount = attendeeRepository.countCheckedInByEventId(eventId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTickets", allAttendees.size());
        stats.put("checkedIn", checkedInCount);
        stats.put("pending", allAttendees.size() - checkedInCount);
        stats.put("checkInRate", allAttendees.isEmpty() ? 0 : 
            (checkedInCount * 100.0 / allAttendees.size()));

        return stats;
    }
}
