package com.ticketkatum.repository;

import com.ticketkatum.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BusRepo extends JpaRepository<Bus,Long> {
    @Query(value = """
            SELECT b.*
            FROM bus b
            JOIN route r ON b.route_id = r.id
            JOIN bus_stop bs1 ON r.source_id = bs1.id
            JOIN bus_stop bs2 ON r.destination_id = bs2.id
            WHERE 
                LOWER(bs1.name) = LOWER(:source)
                AND LOWER(bs2.name) = LOWER(:destination)
                AND DATE(b.departure_date_time) = :date
                AND (:cursor IS NULL OR b.id > :cursor)
            ORDER BY b.id
            LIMIT :pageSize
            """,
            nativeQuery = true)
    List<Bus> searchBuses(
            @Param("source") String source,
            @Param("destination") String destination,
            @Param("date") LocalDate date,
            @Param("cursor") Long cursor,
            @Param("pageSize") int pageSize
    );



}
