package com.ticketkatum.service;

import com.ticketkatum.entity.Attendee;
import com.ticketkatum.repository.AttendeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExportService {

    private final AttendeeRepository attendeeRepository;

    public byte[] exportAttendeesCSV(Long eventId) {
        log.info("Exporting attendees to CSV for event: {}", eventId);

        List<Attendee> attendees = attendeeRepository.findByEventId(eventId);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(outputStream);

        // CSV Header
        writer.println("Ticket ID,Full Name,Email,Phone,Ticket Type,Booking Reference,Check-In Status,Checked In At");

        // CSV Data
        for (Attendee attendee : attendees) {
            String ticketTypeName = attendee.getTicketType() != null
                    ? attendee.getTicketType().getName()
                    : "N/A";
            String bookingRef = attendee.getBooking() != null
                    ? attendee.getBooking().getBookingReference()
                    : "N/A";

            writer.printf("%s,%s,%s,%s,%s,%s,%s,%s%n",
                    attendee.getTicketId(),
                    escapeCsv(attendee.getFullName()),
                    escapeCsv(attendee.getEmail()),
                    escapeCsv(attendee.getPhone()),
                    escapeCsv(ticketTypeName),
                    bookingRef,
                    attendee.getCheckInStatus(),
                    attendee.getCheckedInAt() != null ? attendee.getCheckedInAt().toString() : "");
        }

        writer.flush();
        writer.close();

        log.info("Exported {} attendees to CSV", attendees.size());
        return outputStream.toByteArray();
    }

    private String escapeCsv(String value) {
        if (value == null)
            return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
