package com.ticketkatum.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

/**
 * Metadata for temporarily held rooms during booking process
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomHoldMetadata implements Serializable {

    private String bookingSessionId;
    private List<Long> roomIds;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String userId;
    private Long heldAt;
    private Long expiresAt;

    /**
     * Check if the hold has expired
     */
    public boolean isExpired() {
        return System.currentTimeMillis() > expiresAt;
    }

    /**
     * Get remaining time in seconds
     */
    public long getRemainingSeconds() {
        long remaining = (expiresAt - System.currentTimeMillis()) / 1000;
        return Math.max(0, remaining);
    }
}