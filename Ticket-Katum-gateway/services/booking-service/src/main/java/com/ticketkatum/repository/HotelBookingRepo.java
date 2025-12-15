package com.ticketkatum.repository;

import com.ticketkatum.entity.HotelBooking;
import com.ticketkatum.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HotelBookingRepo extends JpaRepository<HotelBooking, Long> {


    Optional<HotelBooking> findByBookingId(String bookingId);


    Optional<HotelBooking> findByConfirmationNumber(String confirmationNumber);

    List<HotelBooking> findByContactEmail(String email);

    List<HotelBooking> findByStatus(BookingStatus status);

    List<HotelBooking> findByHotelIdAndCheckInDateBetween(
            String hotelId,
            LocalDate startDate,
            LocalDate endDate
    );

    boolean existsByBookingId(String bookingId);

    boolean existsByConfirmationNumber(String confirmationNumber);;
}
