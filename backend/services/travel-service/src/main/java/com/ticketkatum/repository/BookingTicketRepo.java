package com.ticketkatum.repository;

import com.ticketkatum.entity.BookingTicket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingTicketRepo extends JpaRepository<BookingTicket, Long> {

}
