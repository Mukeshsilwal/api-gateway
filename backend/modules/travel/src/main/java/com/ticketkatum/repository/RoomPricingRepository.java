package com.ticketkatum.repository;

import com.ticketkatum.entity.RoomPricing;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomPricingRepository extends JpaRepository<RoomPricing, Long> {

    @Query("""
                SELECT rp FROM RoomPricing rp
                WHERE rp.room.id = :roomId
                AND (:hotelId IS NULL OR rp.room.hotel.id = :hotelId)
                AND (:rentTypeId IS NULL OR rp.rentType.id = :rentTypeId)
                AND (:mealPlanId IS NULL OR rp.mealPlan.id = :mealPlanId)
                AND rp.isActive = true
                AND rp.effectiveFrom <= :date
                AND (rp.effectiveTo IS NULL OR rp.effectiveTo >= :date)
                ORDER BY rp.effectiveFrom DESC
            """)
    List<RoomPricing> findApplicablePricing(
            @Param("hotelId") Long hotelId,
            @Param("roomId") Long roomId,
            @Param("rentTypeId") Long rentTypeId,
            @Param("mealPlanId") Long mealPlanId,
            @Param("date") LocalDate date);

    List<RoomPricing> findByRoomIdAndIsActiveTrue(Long roomId);

    @Query("""
                SELECT rp FROM RoomPricing rp
                WHERE rp.room.hotel.id = :hotelId
                AND rp.isActive = true
                AND rp.effectiveFrom <= :date
                AND (rp.effectiveTo IS NULL OR rp.effectiveTo >= :date)
            """)
    List<RoomPricing> findByHotelIdAndDate(@Param("hotelId") Long hotelId, @Param("date") LocalDate date);
}
