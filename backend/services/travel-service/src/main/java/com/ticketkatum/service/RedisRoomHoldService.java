package com.ticketkatum.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.model.RoomHoldMetadata;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * Service to temporarily hold rooms in Redis during payment processing
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RedisRoomHoldService {

    private final RedisTemplate<String, Object> customRedisTemplate;
    private final ObjectMapper objectMapper;

    private static final String ROOM_HOLD_PREFIX = "room:hold:";
    private static final String BOOKING_SESSION_PREFIX = "booking:session:";
    private static final int HOLD_DURATION_MINUTES = 15; // Hold room for 15 minutes

    /**
     * Hold rooms temporarily during booking process
     *
     * @param bookingSessionId Unique booking session ID
     * @param roomIds List of room IDs to hold
     * @param checkInDate Check-in date
     * @param checkOutDate Check-out date
     * @param userId User ID making the booking
     * @return true if all rooms were successfully held
     */
    public boolean holdRooms(String bookingSessionId, List<Long> roomIds,
                             LocalDate checkInDate, LocalDate checkOutDate, String userId) {
        log.info("Attempting to hold {} rooms for session: {}", roomIds.size(), bookingSessionId);

        List<Long> successfullyHeldRooms = new ArrayList<>();

        try {
            // Check if any rooms are already held
            for (Long roomId : roomIds) {
                String roomHoldKey = ROOM_HOLD_PREFIX + roomId + ":" + checkInDate + ":" + checkOutDate;

                // Try to set the hold (only if key doesn't exist)
                Boolean wasSet = customRedisTemplate.opsForValue()
                        .setIfAbsent(roomHoldKey, bookingSessionId,
                                Duration.ofMinutes(HOLD_DURATION_MINUTES));

                if (Boolean.TRUE.equals(wasSet)) {
                    successfullyHeldRooms.add(roomId);
                    log.info("Room {} held successfully for session {}", roomId, bookingSessionId);
                } else {
                    // Room is already held by someone else
                    String existingSession = (String) customRedisTemplate.opsForValue().get(roomHoldKey);

                    // If it's the same session trying again, allow it
                    if (bookingSessionId.equals(existingSession)) {
                        successfullyHeldRooms.add(roomId);
                        log.info("Room {} already held by same session {}", roomId, bookingSessionId);
                    } else {
                        log.warn("Room {} is already held by session {}", roomId, existingSession);
                        // Release all previously held rooms
                        releaseRooms(bookingSessionId, successfullyHeldRooms, checkInDate, checkOutDate);
                        return false;
                    }
                }
            }

            // Store booking session metadata
            RoomHoldMetadata metadata = RoomHoldMetadata.builder()
                    .bookingSessionId(bookingSessionId)
                    .roomIds(roomIds)
                    .checkInDate(checkInDate)
                    .checkOutDate(checkOutDate)
                    .userId(userId)
                    .heldAt(System.currentTimeMillis())
                    .expiresAt(System.currentTimeMillis() + (HOLD_DURATION_MINUTES * 60 * 1000))
                    .build();

            String sessionKey = BOOKING_SESSION_PREFIX + bookingSessionId;
            customRedisTemplate.opsForValue().set(sessionKey, metadata,
                    Duration.ofMinutes(HOLD_DURATION_MINUTES));

            log.info("All {} rooms held successfully for session {}", roomIds.size(), bookingSessionId);
            return true;

        } catch (Exception e) {
            log.error("Error holding rooms for session {}", bookingSessionId, e);
            // Release any rooms that were held
            releaseRooms(bookingSessionId, successfullyHeldRooms, checkInDate, checkOutDate);
            return false;
        }
    }

    /**
     * Release held rooms after successful payment or timeout
     *
     * @param bookingSessionId Booking session ID
     * @param roomIds List of room IDs to release
     * @param checkInDate Check-in date
     * @param checkOutDate Check-out date
     */
    public void releaseRooms(String bookingSessionId, List<Long> roomIds,
                             LocalDate checkInDate, LocalDate checkOutDate) {
        log.info("Releasing {} rooms for session: {}", roomIds.size(), bookingSessionId);

        for (Long roomId : roomIds) {
            String roomHoldKey = ROOM_HOLD_PREFIX + roomId + ":" + checkInDate + ":" + checkOutDate;

            // Only delete if this session is the one holding it
            String currentHolder = (String) customRedisTemplate.opsForValue().get(roomHoldKey);
            if (bookingSessionId.equals(currentHolder)) {
                customRedisTemplate.delete(roomHoldKey);
                log.info("Released room {} for session {}", roomId, bookingSessionId);
            }
        }

        // Delete session metadata
        String sessionKey = BOOKING_SESSION_PREFIX + bookingSessionId;
        customRedisTemplate.delete(sessionKey);

        log.info("Released all rooms and cleaned up session {}", bookingSessionId);
    }

    /**
     * Confirm booking after successful payment (releases hold and marks as confirmed)
     *
     * @param bookingSessionId Booking session ID
     * @return true if confirmation was successful
     */
    public boolean confirmBooking(String bookingSessionId) {
        log.info("Confirming booking for session: {}", bookingSessionId);

        String sessionKey = BOOKING_SESSION_PREFIX + bookingSessionId;
        RoomHoldMetadata metadata = (RoomHoldMetadata) customRedisTemplate.opsForValue().get(sessionKey);

        if (metadata == null) {
            log.error("No booking session found for ID: {}", bookingSessionId);
            return false;
        }

        // Verify the hold is still valid
        boolean allRoomsStillHeld = true;
        for (Long roomId : metadata.getRoomIds()) {
            String roomHoldKey = ROOM_HOLD_PREFIX + roomId + ":" +
                    metadata.getCheckInDate() + ":" + metadata.getCheckOutDate();
            String currentHolder = (String) customRedisTemplate.opsForValue().get(roomHoldKey);

            if (!bookingSessionId.equals(currentHolder)) {
                log.error("Room {} is no longer held by session {}", roomId, bookingSessionId);
                allRoomsStillHeld = false;
            }
        }

        if (!allRoomsStillHeld) {
            return false;
        }

        // Release the temporary holds
        releaseRooms(bookingSessionId, metadata.getRoomIds(),
                metadata.getCheckInDate(), metadata.getCheckOutDate());

        log.info("Booking confirmed for session {}", bookingSessionId);
        return true;
    }

    /**
     * Check if rooms are available (not held by another session)
     *
     * @param roomIds List of room IDs to check
     * @param checkInDate Check-in date
     * @param checkOutDate Check-out date
     * @param excludeSessionId Session ID to exclude from check (optional)
     * @return true if all rooms are available
     */
    public boolean areRoomsAvailable(List<Long> roomIds, LocalDate checkInDate,
                                     LocalDate checkOutDate, String excludeSessionId) {
        for (Long roomId : roomIds) {
            String roomHoldKey = ROOM_HOLD_PREFIX + roomId + ":" + checkInDate + ":" + checkOutDate;
            String currentHolder = (String) customRedisTemplate.opsForValue().get(roomHoldKey);

            if (currentHolder != null && !currentHolder.equals(excludeSessionId)) {
                log.info("Room {} is currently held by session {}", roomId, currentHolder);
                return false;
            }
        }
        return true;
    }

    /**
     * Extend the hold duration for a booking session
     *
     * @param bookingSessionId Booking session ID
     * @param additionalMinutes Additional minutes to extend
     * @return true if extension was successful
     */
    public boolean extendHold(String bookingSessionId, int additionalMinutes) {
        log.info("Extending hold for session {} by {} minutes", bookingSessionId, additionalMinutes);

        String sessionKey = BOOKING_SESSION_PREFIX + bookingSessionId;
        RoomHoldMetadata metadata = (RoomHoldMetadata) customRedisTemplate.opsForValue().get(sessionKey);

        if (metadata == null) {
            log.error("No booking session found for ID: {}", bookingSessionId);
            return false;
        }

        // Extend each room hold
        for (Long roomId : metadata.getRoomIds()) {
            String roomHoldKey = ROOM_HOLD_PREFIX + roomId + ":" +
                    metadata.getCheckInDate() + ":" + metadata.getCheckOutDate();

            Long currentTtl = customRedisTemplate.getExpire(roomHoldKey, TimeUnit.MINUTES);
            if (currentTtl != null && currentTtl > 0) {
                customRedisTemplate.expire(roomHoldKey,
                        Duration.ofMinutes(currentTtl + additionalMinutes));
            }
        }

        // Extend session metadata
        customRedisTemplate.expire(sessionKey,
                Duration.ofMinutes(HOLD_DURATION_MINUTES + additionalMinutes));

        log.info("Hold extended successfully for session {}", bookingSessionId);
        return true;
    }

    /**
     * Get remaining time for a booking hold
     *
     * @param bookingSessionId Booking session ID
     * @return remaining seconds, or -1 if not found
     */
    public long getRemainingHoldTime(String bookingSessionId) {
        String sessionKey = BOOKING_SESSION_PREFIX + bookingSessionId;
        Long ttl = customRedisTemplate.getExpire(sessionKey, TimeUnit.SECONDS);
        return ttl != null ? ttl : -1;
    }

    /**
     * Get booking session metadata
     *
     * @param bookingSessionId Booking session ID
     * @return RoomHoldMetadata or null if not found
     */
    public RoomHoldMetadata getBookingSession(String bookingSessionId) {
        String sessionKey = BOOKING_SESSION_PREFIX + bookingSessionId;
        return (RoomHoldMetadata) customRedisTemplate.opsForValue().get(sessionKey);
    }
}