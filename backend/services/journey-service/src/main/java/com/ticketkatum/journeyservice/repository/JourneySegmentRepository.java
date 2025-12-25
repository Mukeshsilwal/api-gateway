package com.ticketkatum.journeyservice.repository;

import com.ticketkatum.journeyservice.entity.JourneySegment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JourneySegmentRepository extends JpaRepository<JourneySegment, Long> {

    /**
     * Find all segments for a journey, ordered by sequence
     */
    List<JourneySegment> findByJourney_JourneyIdOrderBySequenceOrderAsc(Long journeyId);

    /**
     * Find segments by type
     */
    List<JourneySegment> findByJourney_JourneyIdAndSegmentType(
            Long journeyId, 
            JourneySegment.SegmentType segmentType
    );

    /**
     * Find segments by status
     */
    List<JourneySegment> findByJourney_JourneyIdAndStatus(
            Long journeyId, 
            JourneySegment.SegmentStatus status
    );

    /**
     * Find segments with booking reference
     */
    @Query("SELECT s FROM JourneySegment s " +
           "WHERE s.journey.journeyId = :journeyId " +
           "AND s.bookingReference IS NOT NULL")
    List<JourneySegment> findSegmentsWithBookings(@Param("journeyId") Long journeyId);

    /**
     * Get next segment in sequence
     */
    @Query("SELECT s FROM JourneySegment s " +
           "WHERE s.journey.journeyId = :journeyId " +
           "AND s.sequenceOrder > :currentOrder " +
           "ORDER BY s.sequenceOrder ASC " +
           "LIMIT 1")
    JourneySegment findNextSegment(
            @Param("journeyId") Long journeyId, 
            @Param("currentOrder") Integer currentOrder
    );

    /**
     * Count segments by journey
     */
    long countByJourney_JourneyId(Long journeyId);

    /**
     * Delete all segments for a journey
     */
    void deleteByJourney_JourneyId(Long journeyId);
}
