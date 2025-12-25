package com.ticketkatum.trackingservice.repository;

import com.ticketkatum.trackingservice.entity.PointOfInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PointOfInterestRepository extends JpaRepository<PointOfInterest, Long> {

    List<PointOfInterest> findByCategoryAndIsActiveTrue(PointOfInterest.POICategory category);

    List<PointOfInterest> findByRegionAndIsActiveTrue(String region);

    List<PointOfInterest> findByTouristTypeAndIsActiveTrue(PointOfInterest.TouristType touristType);

    @Query("SELECT poi FROM PointOfInterest poi WHERE poi.isActive = true " +
           "AND poi.category = :category AND poi.region = :region")
    List<PointOfInterest> findByCategoryAndRegion(
            @Param("category") PointOfInterest.POICategory category,
            @Param("region") String region);

    // Find POIs within a radius (simplified - actual implementation would use spatial queries)
    @Query("SELECT poi FROM PointOfInterest poi WHERE poi.isActive = true " +
           "AND (6371 * acos(cos(radians(:lat)) * cos(radians(poi.latitude)) * " +
           "cos(radians(poi.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
           "sin(radians(poi.latitude)))) <= :radiusKm")
    List<PointOfInterest> findNearbyPOIs(
            @Param("lat") double latitude,
            @Param("lng") double longitude,
            @Param("radiusKm") double radiusKm);

    @Query("SELECT poi FROM PointOfInterest poi WHERE poi.isActive = true " +
           "AND poi.isVerified = true ORDER BY poi.rating DESC")
    List<PointOfInterest> findTopRatedPOIs();
}
