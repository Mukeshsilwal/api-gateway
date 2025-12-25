package com.ticketkatum.journeyservice.repository;

import com.ticketkatum.journeyservice.entity.JourneySuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JourneySuggestionRepository extends JpaRepository<JourneySuggestion, Long> {

    /**
     * Find all suggestions for a journey
     */
    List<JourneySuggestion> findByJourney_JourneyIdOrderByPriorityDescRelevanceScoreDesc(Long journeyId);

    /**
     * Find active suggestions (not accepted, not dismissed, not expired)
     */
    @Query("SELECT s FROM JourneySuggestion s " +
           "WHERE s.journey.journeyId = :journeyId " +
           "AND s.isAccepted = false " +
           "AND s.isDismissed = false " +
           "AND (s.expiresAt IS NULL OR s.expiresAt > :now) " +
           "ORDER BY s.priority DESC, s.relevanceScore DESC")
    List<JourneySuggestion> findActiveSuggestions(
            @Param("journeyId") Long journeyId,
            @Param("now") LocalDateTime now
    );

    /**
     * Find suggestions by type
     */
    List<JourneySuggestion> findByJourney_JourneyIdAndSuggestionType(
            Long journeyId,
            JourneySuggestion.SuggestionType suggestionType
    );

    /**
     * Find accepted suggestions
     */
    List<JourneySuggestion> findByJourney_JourneyIdAndIsAcceptedTrue(Long journeyId);

    /**
     * Find top N suggestions by relevance score
     */
    @Query("SELECT s FROM JourneySuggestion s " +
           "WHERE s.journey.journeyId = :journeyId " +
           "AND s.isAccepted = false " +
           "AND s.isDismissed = false " +
           "ORDER BY s.relevanceScore DESC " +
           "LIMIT :limit")
    List<JourneySuggestion> findTopSuggestions(
            @Param("journeyId") Long journeyId,
            @Param("limit") int limit
    );

    /**
     * Count active suggestions
     */
    @Query("SELECT COUNT(s) FROM JourneySuggestion s " +
           "WHERE s.journey.journeyId = :journeyId " +
           "AND s.isAccepted = false " +
           "AND s.isDismissed = false " +
           "AND (s.expiresAt IS NULL OR s.expiresAt > :now)")
    long countActiveSuggestions(
            @Param("journeyId") Long journeyId,
            @Param("now") LocalDateTime now
    );

    /**
     * Delete expired suggestions
     */
    @Query("DELETE FROM JourneySuggestion s " +
           "WHERE s.expiresAt IS NOT NULL " +
           "AND s.expiresAt < :now")
    void deleteExpiredSuggestions(@Param("now") LocalDateTime now);
}
