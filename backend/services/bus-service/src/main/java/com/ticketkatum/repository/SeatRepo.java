package com.ticketkatum.repository;

import com.ticketkatum.entity.Bus;
import com.ticketkatum.entity.Seat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepo extends JpaRepository<Seat, Long> {

    @Query("SELECT s FROM Seat s WHERE s.status = 'AVAILABLE' ORDER BY s.id ASC")
    List<Seat> findFirstByAvailable();

    List<Seat> findByBusBusName(String busName);

    // List<Seat> findByBusAndReserved(Bus busInfo, boolean reserved); // Removed as
    // reserved is gone

    int countByBus(Bus bus);

    Optional<Seat> findByBusIdAndSeatNumber(Long busId, String seatNumber);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Seat s where s.bus.id = :busId and s.seatNumber in :seatNumbers")
    List<Seat> findAndLockByBusIdAndSeatNumbers(@Param("busId") Long busId,
            @Param("seatNumbers") List<String> seatNumbers);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Seat s where s.id = :seatId")
    Optional<Seat> findSeatForUpdate(Long seatId);

    // For Auto-Release Scheduler
    List<Seat> findByStatusAndHoldExpiresAtBefore(com.ticketkatum.enums.SeatStatus status,
            java.time.LocalDateTime dateTime);

}
