package com.ticketkatum.repository;

import com.ticketkatum.entity.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaitlistRepository extends JpaRepository<Waitlist, Long> {

    List<Waitlist> findByEventId(Long eventId);

    Optional<Waitlist> findByEventIdAndEmail(Long eventId, String email);

    Long countByEventId(Long eventId);

    List<Waitlist> findByEventIdAndStatus(Long eventId, Waitlist.Status status);
}
