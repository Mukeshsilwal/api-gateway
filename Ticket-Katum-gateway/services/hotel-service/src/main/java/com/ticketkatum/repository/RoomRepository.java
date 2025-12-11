package com.ticketkatum.repository;

import com.ticketkatum.entity.Room;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long>, JpaSpecificationExecutor<Room> {

        // FIXED: Use DISTINCT to avoid duplicates from amenities join
        @EntityGraph(attributePaths = { "amenities" })
        @Query("SELECT DISTINCT r FROM Room r WHERE r.hotel.hotelCode = :hotelCode")
        List<Room> findByHotelHotelCode(@Param("hotelCode") String hotelCode);

        List<Room> findByHotelIdAndActiveTrue(Long hotelId);

        List<Room> findByHotelIdAndRoomTypeAndActiveTrue(Long hotelId, String roomType);

        @Query("SELECT COUNT(r) FROM Room r WHERE r.hotel.id = :hotelId AND r.active = true")
        Long countAvailableRoomsByHotelId(@Param("hotelId") Long hotelId);

        @Query("SELECT COUNT(r) FROM Room r " +
                        "WHERE r.hotel.id = :hotelId " +
                        "AND r.roomType = :roomType " +
                        "AND r.active = true")
        Long countAvailableRoomsByHotelIdAndRoomType(
                        @Param("hotelId") Long hotelId,
                        @Param("roomType") String roomType);

        boolean existsByHotelIdAndActiveTrue(Long hotelId);

        /**
         * Check if a room with the given room number exists in the specified hotel
         * Used for duplicate room number validation
         */
        boolean existsByHotelIdAndRoomNumber(Long hotelId, String roomNumber);

        @Query("SELECT r.roomType, COUNT(r), MIN(r.basePrice), MAX(r.basePrice) " +
                        "FROM Room r " +
                        "WHERE r.hotel.id = :hotelId " +
                        "AND r.active = true " +
                        "GROUP BY r.roomType " +
                        "ORDER BY MIN(r.basePrice) ASC")
        List<Object[]> findRoomTypesByHotelId(@Param("hotelId") Long hotelId);

        @Query("SELECT DISTINCT r.roomType FROM Room r " +
                        "WHERE r.hotel.id = :hotelId " +
                        "ORDER BY r.roomType")
        List<String> findDistinctRoomTypesByHotelId(@Param("hotelId") Long hotelId);

        List<Room> findByHotelId(Long hotelId);

        @Query("SELECT r FROM Room r " +
                        "WHERE r.hotel.id = :hotelId " +
                        "AND r.active = true " +
                        "AND r.basePrice BETWEEN :minPrice AND :maxPrice " +
                        "ORDER BY r.basePrice ASC")
        List<Room> findByHotelIdAndPriceRange(
                        @Param("hotelId") Long hotelId,
                        @Param("minPrice") BigDecimal minPrice,
                        @Param("maxPrice") BigDecimal maxPrice);

        // Use Spring Data method naming instead of LIMIT
        Optional<Room> findFirstByHotelIdAndActiveTrueOrderByBasePriceAsc(Long hotelId);

        @Query("SELECT MIN(r.basePrice) FROM Room r " +
                        "WHERE r.hotel.id = :hotelId " +
                        "AND r.active = true")
        BigDecimal findMinPriceByHotelId(@Param("hotelId") Long hotelId);

        @Query("SELECT MAX(r.basePrice) FROM Room r " +
                        "WHERE r.hotel.id = :hotelId " +
                        "AND r.active = true")
        BigDecimal findMaxPriceByHotelId(@Param("hotelId") Long hotelId);

        @Query("SELECT r FROM Room r " +
                        "WHERE r.roomType = :roomType " +
                        "AND r.active = true " +
                        "ORDER BY r.basePrice ASC")
        List<Room> findByRoomTypeAndAvailableTrue(@Param("roomType") String roomType);

        @Query("SELECT r FROM Room r " +
                        "WHERE r.hotel.id = :hotelId " +
                        "AND r.active = true " +
                        "AND r.basePrice <= :maxPrice " +
                        "ORDER BY r.basePrice ASC")
        List<Room> findBudgetRoomsByHotelId(
                        @Param("hotelId") Long hotelId,
                        @Param("maxPrice") BigDecimal maxPrice);

        long countByHotelId(Long hotelId);

        @Query("SELECT AVG(r.basePrice) FROM Room r " +
                        "WHERE r.hotel.id = :hotelId " +
                        "AND r.active = true")
        Double getAverageRoomPriceByHotelId(@Param("hotelId") Long hotelId);

        @Query("SELECT r.roomType, COUNT(r) FROM Room r " +
                        "WHERE r.hotel.id = :hotelId " +
                        "GROUP BY r.roomType " +
                        "ORDER BY r.roomType")
        List<Object[]> countRoomsByTypeForHotel(@Param("hotelId") Long hotelId);

        @Query("SELECT r FROM Room r " +
                        "WHERE r.hotel.id IN :hotelIds " +
                        "AND r.active = true " +
                        "ORDER BY r.hotel.id, r.basePrice ASC")
        List<Room> findByHotelIdIn(@Param("hotelIds") List<Long> hotelIds);

        @Query("SELECT r.hotel.id, COUNT(r) FROM Room r " +
                        "WHERE r.hotel.id IN :hotelIds " +
                        "AND r.active = true " +
                        "GROUP BY r.hotel.id")
        List<Object[]> countAvailableRoomsForHotels(@Param("hotelIds") List<Long> hotelIds);

        @Modifying
        @Transactional
        @Query("UPDATE Room r SET r.active = false WHERE r.id = :roomId")
        void markRoomAsUnavailable(@Param("roomId") Long roomId);

        @Modifying
        @Transactional
        @Query("UPDATE Room r SET r.active = true WHERE r.id = :roomId")
        void markRoomAsAvailable(@Param("roomId") Long roomId);

        List<Room> findByActiveFalse();

        @Query("SELECT r FROM Room r " +
                        "WHERE r.hotel.id = :hotelId " +
                        "ORDER BY r.roomType, r.basePrice")
        List<Room> findAllRoomsByHotelId(@Param("hotelId") Long hotelId);
}
