package com.ticketkatum.repository;

import com.ticketkatum.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

@org.springframework.stereotype.Repository
public interface TicketRepo extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findTicketBySeat_Id(Long aLong);
}
