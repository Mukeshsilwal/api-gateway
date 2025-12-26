package com.ticketkatum.repository;

import com.ticketkatum.entity.Room;
import com.ticketkatum.entity.RoomBooking;
import com.ticketkatum.enums.BookingStatus;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomBookingRepository extends JpaRepository<RoomBooking, Long> {

    Optional<RoomBooking> findByBookingReference(String bookingReference);

    List<RoomBooking> findByCustomerId(Long customerId);

    List<RoomBooking> findByRoomIdAndStatusIn(Long roomId, List<BookingStatus> statuses);

    @Query("""
                SELECT COUNT(rb) FROM RoomBooking rb
                WHERE rb.room.id = :roomId
                AND (
                    rb.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
                    OR (rb.status = 'PENDING' AND rb.createdAt > :expirationThreshold)
                )
                AND (
                    (rb.checkIn < :checkOut AND rb.checkOut > :checkIn) OR
                    (rb.checkIn >= :checkIn AND rb.checkIn < :checkOut) OR
                    (rb.checkOut > :checkIn AND rb.checkOut <= :checkOut)
                )
            """)
    Long countConflictingBookings(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDateTime checkIn,
            @Param("checkOut") LocalDateTime checkOut,
            @Param("expirationThreshold") LocalDateTime expirationThreshold);

    @Query("""
                SELECT r FROM Room r
                WHERE r.hotel.id = :hotelId
                AND (:roomType IS NULL OR r.roomType = :roomType)
                AND r.active = true
                AND r.capacity >= :guestCount
                AND r.id NOT IN (
                    SELECT rb.room.id FROM RoomBooking rb
                    WHERE (
                        rb.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
                        OR (rb.status = 'PENDING' AND rb.createdAt > :expirationThreshold)
                    )
                    AND (
                        (rb.checkIn < :checkOut AND rb.checkOut > :checkIn) OR
                        (rb.checkIn >= :checkIn AND rb.checkIn < :checkOut) OR
                        (rb.checkOut > :checkIn AND rb.checkOut <= :checkOut)
                    )
                )
                ORDER BY r.roomNumber
            """)

    List<Room> findAvailableRooms(
            @Param("hotelId") Long hotelId,
            @Param("roomType") String roomType,
            @Param("checkIn") LocalDateTime checkIn,
            @Param("checkOut") LocalDateTime checkOut,
            @Param("guestCount") Integer guestCount,
            @Param("expirationThreshold") LocalDateTime expirationThreshold);
}