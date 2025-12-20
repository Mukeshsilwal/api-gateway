package com.ticketkatum.repository;

import com.ticketkatum.entity.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Ticket Type Repository
 */
@Repository
public interface TicketTypeRepository extends JpaRepository<TicketType, Long> {

    List<TicketType> findByEventIdOrderBySortOrderAsc(Long eventId);

    @Query("SELECT t FROM TicketType t WHERE t.event.id = :eventId AND t.isActive = true")
    List<TicketType> findActiveByEventId(Long eventId);
}
