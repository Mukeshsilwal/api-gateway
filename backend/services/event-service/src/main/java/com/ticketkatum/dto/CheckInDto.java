package com.ticketkatum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Check-In DTO
 * Response for check-in operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckInDto {
    private Long attendeeId;
    private String attendeeName;
    private String attendeeEmail;
    private Long eventId;
    private String eventName;
    private String ticketType;
    private LocalDateTime checkedInAt;
    private String checkedInBy;
    private boolean alreadyCheckedIn;
    private String message;
}
