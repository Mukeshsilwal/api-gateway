package com.ticketkatum.repository;

import com.ticketkatum.entity.MealService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealServiceRepository extends JpaRepository<MealService, Long> {
    List<MealService> findByBookingIdAndServiceDate(Long bookingId, LocalDate serviceDate);
    List<MealService> findByBookingId(Long bookingId);

    @Query("SELECT ms FROM MealService ms WHERE ms.booking.room.hotel.id = :hotelId AND ms.serviceDate = :date AND ms.served = false")
    List<MealService> findPendingMealsByHotelAndDate(@Param("hotelId") Long hotelId, @Param("date") LocalDate date);
}
