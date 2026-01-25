package com.ticketkatum.repository;

import com.ticketkatum.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@org.springframework.stereotype.Repository
public interface BusRepo extends JpaRepository<Bus, Long> {
    @Query("""
            SELECT b FROM Bus b
            WHERE
                LOWER(TRIM(b.route.sourceBusStop.name)) LIKE LOWER(CONCAT('%', :source, '%'))
                AND LOWER(TRIM(b.route.destinationBusStop.name)) LIKE LOWER(CONCAT('%', :destination, '%'))
                AND b.departureDateTime >= :startDateTime
                AND b.departureDateTime < :endDateTime
                AND (:cursor IS NULL OR b.id > :cursor)
            ORDER BY b.id ASC
            """)
    List<Bus> searchBuses(
            @Param("source") String source,
            @Param("destination") String destination,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime,
            @Param("cursor") Long cursor,
            org.springframework.data.domain.Pageable pageable);

}
