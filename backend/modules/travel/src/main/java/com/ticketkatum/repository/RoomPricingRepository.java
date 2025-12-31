package com.ticketkatum.repository;

import com.ticketkatum.entity.RoomPricing;
import io.lettuce.core.dynamic.annotation.Param;
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
                AND rp.room.hotel.id = :hotelId
                AND rp.rentType.id = :rentTypeId
                AND rp.mealPlan.id = :mealPlanId
                AND rp.isActive = true
                AND rp.effectiveFrom <= :date
                AND (rp.effectiveTo IS NULL OR rp.effectiveTo >= :date)
                ORDER BY rp.effectiveFrom DESC
                LIMIT 1
            """)
    Optional<RoomPricing> findApplicablePricing(
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
