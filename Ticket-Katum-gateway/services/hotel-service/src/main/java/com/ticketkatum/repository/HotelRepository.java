package com.ticketkatum.repository;

import com.ticketkatum.entity.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    Optional<Hotel> findByHotelCode(String hotelCode);

    @EntityGraph(attributePaths = {"images"})
    @Query("SELECT DISTINCT h FROM Hotel h")
    List<Hotel> findAllWithImages();

    @EntityGraph(attributePaths = {"rooms"})
    @Query("SELECT DISTINCT h FROM Hotel h WHERE h.id IN :ids")
    List<Hotel> findWithRoomsByIds(@Param("ids") List<Long> ids);

    boolean existsByHotelCode(String hotelCode);


    @Query(
            value = "SELECT h.id AS id, h.name AS name, h.address AS address, " +
                    "h.latitude AS latitude, h.longitude AS longitude, " +
                    "STRING_AGG(hi.url, ',') AS images " +
                    "FROM hotels h " +
                    "LEFT JOIN hotel_images hi ON hi.hotel_id = h.id " +
                    "WHERE h.id IN (:hotelIds) " +
                    "GROUP BY h.id",
            nativeQuery = true
    )
    List<Map<String, Object>> findHotelWithImagesNative(@Param("hotelIds") List<Long> hotelIds);




    List<Hotel> findByActiveTrue();
    List<Hotel> findByCityIgnoreCaseAndActiveTrue(String city);
    Optional<Hotel> findByIdAndActiveTrue(Long id);
    List<Hotel> findByFeaturedTrueAndActiveTrue();
    Page<Hotel> findByFeaturedTrueAndActiveTrue(Pageable pageable);
    List<Hotel> findByStarRatingAndActiveTrue(Integer starRating);

    @Query("SELECT h FROM Hotel h WHERE h.active = true AND h.starRating >= :minRating ORDER BY h.starRating DESC")
    List<Hotel> findByMinStarRating(@Param("minRating") Integer minRating);

    @Query("SELECT h FROM Hotel h WHERE h.active = true " +
            "AND (LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(h.city) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(h.address) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Hotel> searchHotels(@Param("query") String query, Pageable pageable);

    @Query("SELECT h FROM Hotel h WHERE h.active = true " +
            "AND LOWER(h.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Hotel> findByNameContainingIgnoreCase(@Param("name") String name);

    @Query("SELECT h FROM Hotel h WHERE h.active = true " +
            "AND (:city IS NULL OR LOWER(h.city) = LOWER(:city)) " +
            "AND (:minStarRating IS NULL OR h.starRating >= :minStarRating) " +
            "AND (:maxStarRating IS NULL OR h.starRating <= :maxStarRating) " +
            "AND (:minPrice IS NULL OR h.minPrice >= :minPrice) " +
            "AND (:maxPrice IS NULL OR h.minPrice <= :maxPrice) " +
            "ORDER BY h.averageRating DESC NULLS LAST, h.starRating DESC")
    Page<Hotel> advancedSearch(
            @Param("city") String city,
            @Param("minStarRating") Integer minStarRating,
            @Param("maxStarRating") Integer maxStarRating,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

    @Query("SELECT h FROM Hotel h WHERE h.active = true " +
            "AND h.minPrice BETWEEN :minPrice AND :maxPrice " +
            "ORDER BY h.minPrice ASC")
    List<Hotel> findByPriceRange(
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice
    );

    @Query("SELECT h FROM Hotel h WHERE h.active = true " +
            "AND h.minPrice <= :maxPrice " +
            "ORDER BY h.minPrice ASC")
    List<Hotel> findBudgetHotels(@Param("maxPrice") BigDecimal maxPrice);

    @Query("SELECT h FROM Hotel h WHERE h.active = true " +
            "AND h.averageRating IS NOT NULL " +
            "ORDER BY h.averageRating DESC, h.totalReviews DESC")
    List<Hotel> findTopRatedHotels(Pageable pageable);

    @Query("SELECT h FROM Hotel h WHERE h.active = true " +
            "AND h.averageRating >= :minRating " +
            "ORDER BY h.averageRating DESC")
    List<Hotel> findByMinRating(@Param("minRating") Double minRating);

    @Query("SELECT h FROM Hotel h WHERE h.active = true " +
            "AND h.totalReviews > 0 " +
            "ORDER BY h.totalReviews DESC")
    List<Hotel> findMostReviewedHotels(Pageable pageable);

    @Query("SELECT h.city, COUNT(h) FROM Hotel h " +
            "WHERE h.active = true " +
            "GROUP BY h.city " +
            "ORDER BY COUNT(h) DESC")
    List<Object[]> countHotelsByCity();

    @Query("SELECT h.city, AVG(h.minPrice) FROM Hotel h " +
            "WHERE h.active = true AND h.minPrice IS NOT NULL " +
            "GROUP BY h.city " +
            "ORDER BY h.city")
    List<Object[]> getAveragePriceByCity();

    @Query("SELECT h.city, AVG(h.averageRating) FROM Hotel h " +
            "WHERE h.active = true AND h.averageRating IS NOT NULL " +
            "GROUP BY h.city " +
            "ORDER BY AVG(h.averageRating) DESC")
    List<Object[]> getAverageRatingByCity();

    @Query("SELECT h.starRating, COUNT(h) FROM Hotel h " +
            "WHERE h.active = true " +
            "GROUP BY h.starRating " +
            "ORDER BY h.starRating DESC")
    List<Object[]> countHotelsByStarRating();

    boolean existsByIdAndActiveTrue(Long id);
    long countByActiveTrue();

    @Query("SELECT DISTINCT h FROM Hotel h " +
            "WHERE h.active = true " +
            "AND EXISTS (SELECT 1 FROM Room r WHERE r.hotel = h AND r.active = true)")
    List<Hotel> findHotelsWithAvailableRooms();

    List<Hotel> findByCountryIgnoreCaseAndActiveTrue(String country);

    @Query(value = "SELECT * FROM hotels h " +
            "WHERE h.active = true " +
            "AND h.amenities LIKE CONCAT('%', :amenity, '%')",
            nativeQuery = true)
    List<Hotel> findByAmenity(@Param("amenity") String amenity);

    @Query(value = "SELECT * FROM hotels h " +
            "WHERE h.active = true " +
            "AND h.amenities LIKE CONCAT('%', :amenity1, '%') " +
            "AND h.amenities LIKE CONCAT('%', :amenity2, '%')",
            nativeQuery = true)
    List<Hotel> findByMultipleAmenities(
            @Param("amenity1") String amenity1,
            @Param("amenity2") String amenity2
    );

    // For admin - fetch all data at once
    @EntityGraph(attributePaths = {"images"})
    List<Hotel> findAll();

    List<Hotel> findByActiveFalse();

    @Query("SELECT h FROM Hotel h WHERE h.active = true " +
            "ORDER BY h.createdAt DESC")
    List<Hotel> findRecentlyAdded(Pageable pageable);

    @Query("SELECT h FROM Hotel h WHERE h.active = true " +
            "ORDER BY h.updatedAt DESC")
    List<Hotel> findRecentlyUpdated(Pageable pageable);

    // Your native queries with distance calculation
    @Query(value = """
        SELECT * FROM (
            SELECT h.*, 
                   (6371 * acos(
                       cos(radians(:latitude)) * cos(radians(h.latitude)) 
                       * cos(radians(h.longitude) - radians(:longitude)) 
                       + sin(radians(:latitude)) * sin(radians(h.latitude))
                   )) AS distance
            FROM hotels h
            WHERE h.active = true
              AND h.latitude IS NOT NULL
              AND h.longitude IS NOT NULL
        ) AS hotels_with_distance
        WHERE distance <= :radiusKm
        ORDER BY distance ASC
        LIMIT :limit OFFSET :offset
        """, nativeQuery = true)
    List<Hotel> findHotelsWithinRadius(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radiusKm") Double radiusKm,
            @Param("limit") Integer limit,
            @Param("offset") Integer offset
    );

    @Query(value = """
        SELECT * FROM (
            SELECT h.*, 
                   (6371 * acos(
                       cos(radians(:latitude)) * cos(radians(h.latitude)) 
                       * cos(radians(h.longitude) - radians(:longitude)) 
                       + sin(radians(:latitude)) * sin(radians(h.latitude))
                   )) AS distance
            FROM hotels h
            WHERE h.active = true
              AND h.latitude IS NOT NULL
              AND h.longitude IS NOT NULL
              AND (:minStarRating IS NULL OR h.star_rating >= :minStarRating)
              AND (:maxPrice IS NULL OR h.min_price <= :maxPrice)
        ) AS hotels_with_distance
        WHERE distance <= :radiusKm
        ORDER BY 
          CASE 
            WHEN :sortBy = 'price' THEN min_price 
            ELSE NULL 
          END ASC NULLS LAST,
          CASE 
            WHEN :sortBy = 'rating' THEN average_rating 
            ELSE NULL 
          END DESC NULLS LAST,
          distance ASC
        LIMIT :limit OFFSET :offset
        """, nativeQuery = true)
    List<Hotel> findHotelsWithFilters(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radiusKm") Double radiusKm,
            @Param("minStarRating") Integer minStarRating,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("sortBy") String sortBy,
            @Param("limit") Integer limit,
            @Param("offset") Integer offset
    );

    @Query(value = """
        SELECT COUNT(*) FROM (
            SELECT h.id,
                   (6371 * acos(
                       cos(radians(:latitude)) * cos(radians(h.latitude)) 
                       * cos(radians(h.longitude) - radians(:longitude)) 
                       + sin(radians(:latitude)) * sin(radians(h.latitude))
                   )) AS distance
            FROM hotels h
            WHERE h.active = true
              AND h.latitude IS NOT NULL
              AND h.longitude IS NOT NULL
        ) AS hotels_with_distance
        WHERE distance <= :radiusKm
        """, nativeQuery = true)
    Long countHotelsWithinRadius(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radiusKm") Double radiusKm
    );

    @Query(value = """
        SELECT * FROM (
            SELECT h.*, 
                   (6371 * acos(
                       cos(radians(:latitude)) * cos(radians(h.latitude)) 
                       * cos(radians(h.longitude) - radians(:longitude)) 
                       + sin(radians(:latitude)) * sin(radians(h.latitude))
                   )) AS distance
            FROM hotels h
            WHERE h.active = true
              AND h.latitude IS NOT NULL
              AND h.longitude IS NOT NULL
        ) AS hotels_with_distance
        ORDER BY distance ASC
        LIMIT :limit
        """, nativeQuery = true)
    List<Hotel> findNearestHotels(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("limit") Integer limit
    );
}