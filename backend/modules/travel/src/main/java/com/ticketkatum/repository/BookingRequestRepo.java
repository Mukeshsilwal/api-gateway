package com.ticketkatum.repository;

import com.ticketkatum.entity.BookingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@org.springframework.stereotype.Repository
public interface BookingRequestRepo extends JpaRepository<BookingRequest, Integer> {

    void deleteBySeatTicketTicketNoAndSeatTicketBookingTicketEmail(
            long ticketNo, String email);
}




