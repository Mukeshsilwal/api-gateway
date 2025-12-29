package com.ticketkatum.repository;

import com.ticketkatum.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Event Repository
 */
@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    Optional<Event> findBySlug(String slug);

    Page<Event> findByStatus(Event.EventStatus status, Pageable pageable);

    Page<Event> findByOrganizerId(Long organizerId, Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.organizer.id = :organizerId AND e.status = :status")
    Page<Event> findByOrganizerIdAndStatus(
        @Param("organizerId") Long organizerId,
        @Param("status") Event.EventStatus status,
        Pageable pageable
    );

    @Query("SELECT e FROM Event e WHERE e.status = 'PUBLISHED' " +
           "AND e.startDateTime > :now ORDER BY e.views DESC, e.likes DESC")
    List<Event> findFeaturedEvents(@Param("now") LocalDateTime now, Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.status = 'PUBLISHED' " +
           "AND e.category = :category AND e.startDateTime > :now")
    Page<Event> findByCategory(
        @Param("category") Event.EventCategory category,
        @Param("now") LocalDateTime now,
        Pageable pageable
    );

    @Query("SELECT e FROM Event e WHERE e.status = 'PUBLISHED' " +
           "AND e.startDateTime BETWEEN :startDate AND :endDate")
    Page<Event> findByDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    @Query("SELECT e FROM Event e WHERE e.status = 'PUBLISHED' " +
           "AND LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Event> searchByName(@Param("query") String query, Pageable pageable);

    boolean existsBySlug(String slug);
}
