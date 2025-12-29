package com.ticketkatum.trackingservice.repository;

import com.ticketkatum.trackingservice.entity.LocationTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LocationTrackingRepository extends JpaRepository<LocationTracking, Long> {

    List<LocationTracking> findByTripIdOrderByTimestampDesc(Long tripId);

    List<LocationTracking> findByEntityTypeAndEntityIdOrderByTimestampDesc(
            LocationTracking.EntityType entityType, Long entityId);

    @Query("SELECT lt FROM LocationTracking lt WHERE lt.tripId = :tripId " +
           "AND lt.timestamp >= :startTime ORDER BY lt.timestamp DESC")
    List<LocationTracking> findRecentLocationsByTrip(
            @Param("tripId") Long tripId,
            @Param("startTime") LocalDateTime startTime);

    @Query("SELECT lt FROM LocationTracking lt WHERE lt.entityType = :entityType " +
           "AND lt.entityId = :entityId AND lt.timestamp >= :startTime " +
           "ORDER BY lt.timestamp DESC")
    List<LocationTracking> findRecentLocationsByEntity(
            @Param("entityType") LocationTracking.EntityType entityType,
            @Param("entityId") Long entityId,
            @Param("startTime") LocalDateTime startTime);

    @Query("SELECT lt FROM LocationTracking lt WHERE lt.entityType = :entityType " +
           "AND lt.entityId = :entityId ORDER BY lt.timestamp DESC LIMIT 1")
    Optional<LocationTracking> findLatestLocationByEntity(
            @Param("entityType") LocationTracking.EntityType entityType,
            @Param("entityId") Long entityId);

    @Query("SELECT lt FROM LocationTracking lt WHERE lt.tripId = :tripId " +
           "ORDER BY lt.timestamp DESC LIMIT 1")
    Optional<LocationTracking> findLatestLocationByTrip(@Param("tripId") Long tripId);

    @Query("SELECT COUNT(lt) FROM LocationTracking lt WHERE lt.tripId = :tripId")
    long countByTripId(@Param("tripId") Long tripId);

    @Query("SELECT lt FROM LocationTracking lt WHERE lt.isOffline = true " +
           "AND lt.timestamp >= :since")
    List<LocationTracking> findOfflineLocations(@Param("since") LocalDateTime since);
}
