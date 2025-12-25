package com.ticketkatum.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Attendee Entity
 * Represents individual ticket holders
 */
@Entity
@Table(name = "attendees", indexes = {
        @Index(name = "idx_attendee_qr", columnList = "qr_code", unique = true),
        @Index(name = "idx_attendee_ticket", columnList = "ticket_id", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonBackReference
    private EventBooking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_type_id", nullable = false)
    private TicketType ticketType;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "qr_code", nullable = false, unique = true, columnDefinition = "TEXT")
    private String qrCode;

    @Column(name = "ticket_id", nullable = false, unique = true, length = 50)
    private String ticketId;

    @Enumerated(EnumType.STRING)
    @Column(name = "check_in_status", nullable = false, length = 50)
    @Builder.Default
    private CheckInStatus checkInStatus = CheckInStatus.PENDING;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    @Column(name = "checked_in_by")
    private String checkedInBy;

    @Column(name = "check_in_location")
    private String checkInLocation;

    @Column(name = "additional_info", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String additionalInfo; // JSON for custom fields

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum CheckInStatus {
        PENDING, CHECKED_IN, CANCELLED
    }

    // Helper methods
    public String getFullName() {
        return firstName + " " + lastName;
    }

    public boolean isCheckedIn() {
        return checkInStatus == CheckInStatus.CHECKED_IN;
    }
}
